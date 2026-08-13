import React, { useMemo, useState } from "react";
import { C, speckle } from "../game/palette";
import { Body, Display, Mono, PixelButton, PixelChip, PixelSprite } from "../components/Pixel";
import {
  CHECKS_OUT_REASONS,
  MISLEADING_REASONS,
  REASONS,
  type Hotspot,
  type ReasonId,
} from "../game/cases";
import { VERDICTS, VERDICT, type Verdict } from "../game/mil";
import { REQUIRED_REASONS, type Mark } from "../game/marks";

/* Screen 6 - MARK THE CLAIM.

   Five states, not two: most misinformation is technically accurate. And two
   reasons, not one -- being made to name a second reason is what stops the
   modal being a coin flip with extra steps. The confirm button stays dead
   until both are down. */

const VERDICT_EXAMPLES: Partial<Record<string, string>> = {
  checks_out: "e.g. A hospital confirms a patient count that matches public admissions records.",
  biased: "e.g. A tobacco company funds a study concluding their product is low risk.",
  context: "e.g. Crime is up 20% -- true, but it compares a pandemic low to normal levels.",
  misleading: "e.g. Headline says City doubles police budget -- the actual increase was 2%.",
  false: "e.g. Article claims a study said X, but the study never mentions X at all.",
};

const REASON_EXAMPLES: Partial<Record<string, string>> = {
  nosource: "The claim is made without citing any study, official, or record.",
  exaggerate: "The real number is 12 -- the article says nearly 100.",
  context: "The stat is real but the article leaves out a crucial fact that changes the meaning.",
  fabricated: "A quote, number, or event invented without any source.",
  cherry: "Picking one year where the number looks bad while ignoring the longer trend.",
  onrecord: "A named person or institution is directly quoted and on the record.",
  records: "You can find it in a public document -- a filing, census, court record.",
  confirmed: "Two or more independent sources report the same fact.",
  outdated: "The number is real but from a study that is several years old.",
  conflict: "The source that made the claim has a financial or political stake in it.",
  attribution: "No one is named -- experts say or sources claim with no specifics.",
  unverified: "No other reporter or dataset backs this claim up.",
};

function reasonPool(hs: Hotspot, verdict: Verdict): ReasonId[] {
  if (VERDICT[verdict].family === "clean") return CHECKS_OUT_REASONS;
  const authored = hs.chips.filter((c) => MISLEADING_REASONS.includes(c));
  const rest = MISLEADING_REASONS.filter((r) => !authored.includes(r));
  return [...authored, ...rest];
}

export function MarkModal({
  hs,
  existing,
  canRecheck,
  onCancel,
  onConfirm,
}: {
  hs: Hotspot;
  existing?: Mark;
  canRecheck: boolean;
  onCancel: () => void;
  onConfirm: (m: Mark) => void;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(existing?.verdict ?? null);
  const [reasons, setReasons] = useState<ReasonId[]>(existing?.reasons ?? []);
  const [confirmRecheck, setConfirmRecheck] = useState(false);
  const [expandedVerdict, setExpandedVerdict] = useState<Verdict | null>(null);
  const [expandedReason, setExpandedReason] = useState<ReasonId | null>(null);
  const locked = Boolean(existing) && !canRecheck;
  const pool = useMemo(() => (verdict ? reasonPool(hs, verdict) : []), [hs, verdict]);
  const enough = reasons.length >= REQUIRED_REASONS;

  const toggle = (r: ReasonId) =>
    setReasons((rs) =>
      rs.includes(r) ? rs.filter((x) => x !== r) : rs.length >= REQUIRED_REASONS ? [rs[1], r] : [...rs, r],
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mark this claim"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        backgroundColor: "rgba(20,24,28,0.66)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bth-scroll"
        style={{
          width: 560,
          maxWidth: "100%",
          maxHeight: "100%",
          overflowY: "auto",
          padding: 10,
          ...speckle(C.paper, C.paper2, 4),
          boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 3px ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Display size={9} color={C.red}>
            MARK THIS CLAIM
          </Display>
          <Mono size={13} color={C.paper4}>
            {hs.source.toUpperCase()}
          </Mono>
        </div>

        <div
          style={{
            margin: "7px 0",
            padding: 6,
            backgroundColor: C.paper3,
            boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Body size={14} color={C.ink}>
            &ldquo;{hs.text}&rdquo;
          </Body>
        </div>

        <Mono size={13} color={C.ink3}>
          STEP 1 -- WHAT IS IT?
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          {VERDICTS.map((v) => {
            const on = verdict === v.id;
            const expanded = expandedVerdict === v.id;
            return (
              <div key={v.id} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                  <button
                    type="button"
                    data-interactive="verdict"
                    aria-pressed={on}
                    aria-label={"Verdict -- " + v.label}
                    disabled={locked}
                    onClick={() => {
                      setVerdict(v.id);
                      setReasons([]);
                    }}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      textAlign: "left",
                      border: "none",
                      cursor: locked ? "not-allowed" : "pointer",
                      padding: "4px 6px",
                      minHeight: 32,
                      backgroundColor: on ? C.white : C.paper2,
                      boxShadow: on
                        ? `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}, inset 6px 0 0 0 ${v.color}`
                        : `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.paper4}, inset 6px 0 0 0 ${v.color}`,
                    }}
                  >
                    <span style={{ padding: "0 3px", backgroundColor: v.color, minWidth: 26, textAlign: "center" }}>
                      <Mono size={13} color={C.white}>
                        {v.code}
                      </Mono>
                    </span>
                    <PixelSprite name={v.sprite} scale={1} desaturate={!on} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <Mono size={14} color={C.ink}>
                        {v.label}
                      </Mono>
                      <br />
                      <Body size={12} color={C.ink3}>
                        {v.blurb}
                      </Body>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={(expanded ? "Hide" : "Show") + " example for " + v.label}
                    onClick={(e) => { e.stopPropagation(); setExpandedVerdict(expanded ? null : v.id); }}
                    style={{
                      padding: "4px 7px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: expanded ? C.paper3 : C.paper2,
                      boxShadow: `inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.paper4}`,
                    }}
                  >
                    <Mono size={12} color={C.paper4}>{"?"}</Mono>
                  </button>
                </div>
                {expanded && VERDICT_EXAMPLES[v.id] ? (
                  <div
                    style={{
                      padding: "4px 8px",
                      backgroundColor: C.paper3,
                      boxShadow: `inset 3px 0 0 0 ${v.color}, 0 0 0 2px ${C.paper4}`,
                      marginTop: 1,
                    }}
                  >
                    <Body size={12} color={C.ink3}>{VERDICT_EXAMPLES[v.id]}</Body>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 9 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <Mono size={13} color={C.ink3}>
              STEP 2 -- PICK TWO REASONS
            </Mono>
            <Mono size={13} color={enough ? C.green : C.red}>
              {reasons.length}/{REQUIRED_REASONS}
            </Mono>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
            {pool.length ? (
              pool.map((r) => (
                <div key={r} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PixelChip active={reasons.includes(r)} disabled={locked} onClick={() => toggle(r)}>
                      {REASONS[r]}
                    </PixelChip>
                    <button
                      type="button"
                      aria-label={"Explain " + REASONS[r]}
                      onClick={() => setExpandedReason(expandedReason === r ? null : r)}
                      style={{
                        padding: "1px 4px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: expandedReason === r ? C.paper3 : "transparent",
                        color: C.paper4,
                        fontFamily: "monospace",
                        fontSize: 10,
                      }}
                    >{"?"}</button>
                  </div>
                  {expandedReason === r && REASON_EXAMPLES[r] ? (
                    <div
                      style={{
                        marginTop: 2,
                        padding: "3px 6px",
                        backgroundColor: C.paper3,
                        boxShadow: `inset 2px 0 0 0 ${C.brass}, 0 0 0 1px ${C.paper4}`,
                        maxWidth: 220,
                      }}
                    >
                      <Body size={11} color={C.ink3}>{REASON_EXAMPLES[r]}</Body>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <Body size={13} color={C.paper4}>
                Call it first, then say why -- twice.
              </Body>
            )}
          </div>
          {verdict && !enough ? (
            <div style={{ marginTop: 4 }}>
              <Mono size={12} color={C.paper4}>
                ONE REASON IS A HUNCH. TWO IS AN ARGUMENT.
              </Mono>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <PixelButton variant="ink" size={9} onClick={onCancel} label="Button - Cancel">
            CANCEL
          </PixelButton>
          <PixelButton
            variant="brass"
            size={9}
            icon="stamp"
            iconScale={1}
            disabled={!verdict || !enough || locked}
            onClick={() => {
              if (!verdict || !enough) return;
              if (existing && canRecheck) {
                setConfirmRecheck(true);
              } else {
                onConfirm({ verdict, reasons });
              }
            }}
            label="Button - Confirm mark"
          >
            {existing && canRecheck ? "RE-CHECK (USES SECOND SOURCE)" : existing ? "RE-CHECK" : "MARK IT"}
          </PixelButton>
        </div>

        {existing && !canRecheck ? (
          <div style={{ marginTop: 6 }}>
            <Mono size={13} color={C.red}>
              ALREADY MARKED -- NEEDS A SECOND SOURCE TO CHANGE
            </Mono>
          </div>
        ) : null}

        {confirmRecheck ? (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              backgroundColor: C.ink,
              boxShadow: `0 0 0 2px ${C.red}`,
            }}
          >
            <Mono size={13} color={C.red}>
              THIS WILL USE YOUR SECOND SOURCE ITEM
            </Mono>
            <br />
            <Body size={13} color={C.paper}>
              One Second Source charge will be spent. This cannot be undone.
            </Body>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <PixelButton variant="ink" size={9} onClick={() => setConfirmRecheck(false)} label="Button - Cancel recheck">
                CANCEL
              </PixelButton>
              <PixelButton
                variant="red"
                size={9}
                icon="stamp"
                iconScale={1}
                onClick={() => { setConfirmRecheck(false); verdict && onConfirm({ verdict, reasons }); }}
                label="Button - Confirm recheck"
              >
                USE IT + REMARK
              </PixelButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
