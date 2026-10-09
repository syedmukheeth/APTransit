import {
  type ScanReason,
  type ServiceType,
  type ValidateTicketInput,
  type ValidateTicketResult,
  type ValidatorKind,
  formatIstDate,
} from "@aptransit/shared";
import { Injectable, Logger } from "@nestjs/common";
import { DomainEventsService } from "../../common/events/domain-events.service";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { AuditService, type LogAuditParams } from "../audit/audit.service";
import { QrService } from "../tickets/qr.service";
import { scanStatusReason } from "../tickets/ticket-rules";
import { readLive } from "../tracking/live-state";
import { type GpsBox, gpsBoxOf } from "../tracking/tracking.service";
import { TripContextService } from "../tracking/trip-context.service";
import { type BoardingStopRef, resolveBoardingStop } from "./boarding-stop";
import { ConductorService } from "./conductor.service";

type Actor = Pick<LogAuditParams, "actorUserId" | "actorRole" | "ip" | "userAgent">;

/**
 * Who is validating and on which bus and trip (D-035). The conductor endpoint builds it from the
 * conductor's running assignment; the door scanner (P5) builds it from the paired device. One code
 * path validates for both.
 */
export interface ValidatorContext {
  kind: ValidatorKind;
  conductorId: string | null;
  deviceId: string | null;
  busId: string;
  tripId: string;
  routeNameEn: string;
  serviceType: ServiceType;
  /** The trip record's last reached stop: bounds the boarding stop when the bus GPS is stale. */
  lastStopSeq: number | null;
  stops: (BoardingStopRef & { nameEn: string; nameTe: string })[];
  /** The state box for device positions; absent when the state could not be loaded. */
  box?: GpsBox;
}

@Injectable()
export class ValidateService {
  private readonly logger = new Logger(ValidateService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly conductor: ConductorService,
    private readonly trips: TripContextService,
    private readonly qr: QrService,
    private readonly audit: AuditService,
    private readonly events: DomainEventsService,
  ) {}

  /** POST /tickets/validate: the conductor's running assignment is the validator context. */
  async validateAsConductor(userId: string, input: ValidateTicketInput, actor: Actor, now = new Date()): Promise<ValidateTicketResult> {
    const a = await this.conductor.current(userId, input.tripId, now);
    let box: GpsBox | undefined;
    try {
      box = gpsBoxOf(await this.trips.stateOf(a.trip.route.depot.districtId));
    } catch {
      // Without the state box a device position is still used (bus GPS was checked on ingest)
    }
    return this.validate(
      {
        kind: "CONDUCTOR",
        conductorId: a.conductorId,
        deviceId: null,
        busId: a.busId,
        tripId: a.tripId,
        routeNameEn: a.trip.route.nameEn,
        serviceType: a.bus.busType.serviceType,
        lastStopSeq: a.trip.lastStopSeq,
        stops: a.trip.route.routeStops.map((rs) => ({
          stopId: rs.stopId,
          seq: rs.seq,
          lat: rs.stop.lat,
          lng: rs.stop.lng,
          nameEn: rs.stop.nameEn,
          nameTe: rs.stop.nameTe,
        })),
        box,
      },
      input,
      actor,
      now,
    );
  }

  async validate(
    ctx: ValidatorContext,
    input: ValidateTicketInput,
    actor: Actor,
    now = new Date(),
  ): Promise<ValidateTicketResult> {
    const started = performance.now();
    // D-035: where the bus is, read before the transaction (Redis, then a pure rule)
    const live = await readLive(this.redis.client, ctx.tripId);
    const boarding = resolveBoardingStop(
      ctx.stops,
      live ? { lat: live.lat, lng: live.lng, recordedAt: live.recordedAt, nextStopSeq: live.nextStopSeq } : null,
      input.position ?? null,
      now,
      { box: ctx.box, lastStopSeq: ctx.lastStopSeq },
    );
    const seqOf = new Map(ctx.stops.map((stop) => [stop.stopId, stop.seq]));
    const boardingStop = boarding.stopId ? (ctx.stops.find((stop) => stop.stopId === boarding.stopId) ?? null) : null;
    // D-027: manual entry supplies possession of the same live rotating code. The token is rebuilt
    // only from trusted database fields, then enters the unchanged signature/code/rule pipeline.
    let qrText = "qr" in input ? input.qr : "";
    if ("ticketNumber" in input) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { code: input.ticketNumber },
        select: {
          id: true,
          tripId: true,
          validUntil: true,
          expiresAt: true,
          trip: { select: { serviceDate: true, scheduledDepartureAt: true } },
        },
      });
      if (ticket)
        qrText =
          this.qr.signToken({
            t: "T",
            i: ticket.id,
            tr: ticket.tripId,
            d: formatIstDate(ticket.trip.serviceDate),
            v: Math.floor((ticket.validUntil ?? ticket.expiresAt).getTime() / 1000),
          }) +
          "~" +
          input.liveCode;
    }
    const content = await this.qr.verifyContent(qrText);
    let reason: ScanReason = typeof content === "string" ? content : "NOT_FOUND";
    let ticketId: string | null = null;
    let passId: string | null = null;
    let holderUserId: string | null = null;
    let earlierScanAt: string | undefined;
    let detail: ValidateTicketResult["ticket"];
    let context: ValidateTicketResult["context"];

    const outcome = await this.prisma.$transaction(async (tx) => {
      if (typeof content !== "string") {
        const { payload, code } = content;
        const ticket =
          payload.t === "T"
            ? await tx.ticket.findUnique({
                relationLoadStrategy: "join",
                where: { id: payload.i },
                select: {
                  id: true,
                  status: true,
                  validUntil: true,
                  qrSecret: true,
                  tripId: true,
                  holderUserId: true,
                  version: true,
                  scannedAt: true,
                  seatNo: true,
                  type: true,
                  passenger: { select: { name: true } },
                  holderUser: { select: { name: true } },
                  trip: { select: { serviceDate: true, scheduledDepartureAt: true } },
                  route: { select: { nameEn: true } },
                  boardingStopId: true,
                  droppingStopId: true,
                  boardingStop: { select: { nameEn: true, nameTe: true } },
                  droppingStop: { select: { nameEn: true, nameTe: true } },
                  scans: {
                    where: { tripId: ctx.tripId, result: "VALID" },
                    orderBy: { scannedAt: "asc" },
                    take: 1,
                    select: { scannedAt: true },
                  },
                },
              })
            : null;
        const pass =
          payload.t === "P"
            ? await tx.pass.findUnique({
                where: { id: payload.i },
                select: {
                  id: true,
                  status: true,
                  validFrom: true,
                  validUntil: true,
                  qrSecret: true,
                  passType: { select: { eligibleServiceTypes: true } },
                  user: { select: { name: true } },
                  scans: {
                    where: { tripId: ctx.tripId, result: "VALID" },
                    orderBy: { scannedAt: "asc" },
                    take: 1,
                    select: { scannedAt: true },
                  },
                },
              })
            : null;
        const row = ticket ?? pass;
        ticketId = ticket?.id ?? null;
        passId = pass?.id ?? null;
        if (row) {
          context = {
            validUntil: row.validUntil?.toISOString() ?? null,
            boardingStop: boardingStop
              ? { stopId: boardingStop.stopId, nameEn: boardingStop.nameEn, nameTe: boardingStop.nameTe, source: boarding.source }
              : null,
            ...(ticket
              ? {
                  route: ticket.route.nameEn,
                  departureAt: ticket.trip.scheduledDepartureAt.toISOString(),
                  serviceDate: formatIstDate(ticket.trip.serviceDate),
                  ticketFrom: ticket.boardingStop,
                  ticketTo: ticket.droppingStop,
                }
              : {
                  services: pass!.passType.eligibleServiceTypes,
                  validFrom: pass!.validFrom?.toISOString() ?? null,
                }),
          };
          const validCode = await this.qr.verifyCode(
            this.qr.decryptRotSecret(row.qrSecret),
            code,
            now.getTime(),
          );
          const earlier = row.scans[0];
          reason = validCode
            ? scanStatusReason({
                status: row.status,
                validUntil: row.validUntil,
                now,
                alreadyScanned: Boolean(earlier),
                wrongTrip: Boolean(
                  ticket && (ticket.tripId !== ctx.tripId || payload.tr !== ticket.tripId),
                ),
                wrongDate: Boolean(
                  ticket &&
                  (payload.d !== formatIstDate(now) ||
                    formatIstDate(ticket.trip.serviceDate) !== formatIstDate(now)),
                ),
                serviceEligible: !pass || pass.passType.eligibleServiceTypes.includes(ctx.serviceType),
                // D-035 segment checks; a null stopSeq (source NONE) skips them
                stopSeq: boarding.seq,
                boardingSeq: ticket ? (seqOf.get(ticket.boardingStopId) ?? null) : null,
                droppingSeq: ticket ? (seqOf.get(ticket.droppingStopId) ?? null) : null,
                validFrom: pass?.validFrom ?? null,
                // Route restricted passes (home and destination stops) arrive with the pass catalog (P4)
                routeCovered: true,
              })
            : "STALE_CODE";
          if (reason === "OK") {
            if (ticket) {
              const changed = await tx.ticket.updateMany({
                where: { id: ticket.id, status: "ACTIVE", version: ticket.version },
                data: { status: "SCANNED", scannedAt: now, version: { increment: 1 } },
              });
              if (changed.count !== 1) reason = "ALREADY_SCANNED";
              else holderUserId = ticket.holderUserId;
            } else {
              // Serialize pass scans for a trip across processes, then recheck the winning scan.
              const locked = await tx.pass.update({
                where: { id: pass!.id },
                data: { updatedAt: now },
              });
              reason = scanStatusReason({
                status: locked.status,
                validUntil: locked.validUntil,
                now,
                alreadyScanned: false,
                wrongTrip: false,
                wrongDate: false,
                serviceEligible: true,
              });
              const winner = await tx.ticketScan.findFirst({
                where: { passId: pass!.id, tripId: ctx.tripId, result: "VALID" },
              });
              if (winner && reason === "OK") {
                reason = "ALREADY_SCANNED";
                earlierScanAt = winner.scannedAt.toISOString();
              }
            }
          }
          if (reason === "ALREADY_SCANNED" && !earlierScanAt) {
            const scanned =
              ticket?.scannedAt ??
              earlier?.scannedAt ??
              (
                await tx.ticket.findUnique({
                  where: { id: ticketId ?? "missing" },
                  select: { scannedAt: true },
                })
              )?.scannedAt;
            if (scanned) earlierScanAt = scanned.toISOString();
          }
          if (reason === "OK")
            detail = ticket
              ? {
                  passengerName: ticket.passenger?.name ?? ticket.holderUser.name ?? "",
                  seatNo: ticket.seatNo,
                  routeName: ticket.route.nameEn,
                  boarding: ticket.boardingStop.nameEn,
                  dropping: ticket.droppingStop.nameEn,
                  type: ticket.type,
                }
              : {
                  passengerName: pass!.user.name ?? "",
                  seatNo: null,
                  routeName: ctx.routeNameEn,
                  boarding: "",
                  dropping: "",
                  type: "PASS",
                };
        }
      }
      return tx.ticketScan.create({
        data: {
          ticketId,
          passId,
          tripId: ctx.tripId,
          conductorId: ctx.conductorId,
          result: reason === "OK" ? "VALID" : "INVALID",
          reason,
          scannedAt: now,
          deviceTime: new Date(input.deviceTime),
          offline: false,
          // D-035 boarding record: bus, stop, location and validator on every scan
          busId: ctx.busId,
          stopId: boarding.stopId,
          stopSource: boarding.source,
          lat: boarding.lat,
          lng: boarding.lng,
          deviceId: ctx.deviceId,
          validatorKind: ctx.kind,
        },
      });
    });
    await this.audit.log({
      action: "ticket.scan",
      entityType: "ticket_scan",
      entityId: outcome.id,
      after: { result: outcome.result, reason, validatorKind: ctx.kind, busId: ctx.busId, stopSource: boarding.source },
      ...actor,
    });
    this.events.publish("conductor.scan", { tripId: ctx.tripId });
    if (holderUserId && ticketId)
      this.events.publish("ticket.status", {
        ticketId,
        holderUserId,
        from: "ACTIVE",
        to: "SCANNED",
      });
    this.logger.log(
      {
        durationMs: Math.round((performance.now() - started) * 100) / 100,
        result: outcome.result,
        reason,
      },
      "Ticket validation timing",
    );
    return {
      result: outcome.result,
      reason,
      ...(earlierScanAt ? { earlierScanAt } : {}),
      ...(detail ? { ticket: detail } : {}),
      ...(context ? { context } : {}),
    };
  }
}
