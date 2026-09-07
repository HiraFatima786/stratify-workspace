'use client';

import React, { useState } from 'react';
import { Lock, Award, DollarSign, X, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

export default function LockedInfoPanels() {
  const [activeModal, setActiveModal] = useState<'certificate' | 'commission' | null>(null);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Certificate Panel */}
        <div
          onClick={() => setActiveModal('certificate')}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--accent-blue-soft)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              My Completion Certificate
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click to view your certificate status
            </p>
          </div>
        </div>

        {/* Commission Panel */}
        <div
          onClick={() => setActiveModal('commission')}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DollarSign size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Commission Distribution
              </h3>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: 'var(--accent-emerald-soft)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid #abf5d1',
                }}
              >
                5% – 15%
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              View performance tiers and closure policy
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 30, 66, 0.58)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: '12px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="glass-panel commission-modal-card"
            style={{
              maxWidth: activeModal === 'commission' ? '640px' : '520px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f4f5f7',
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}
              >
                {activeModal === 'certificate' ? (
                  <>
                    <Award size={20} color="var(--accent-primary)" /> Completion Certificate
                  </>
                ) : (
                  <>
                    <DollarSign size={20} color="var(--accent-emerald)" /> Intern Commission Policy
                  </>
                )}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="commission-modal-body">
              {activeModal === 'certificate' ? (
                <div
                  style={{
                    position: 'relative',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Blurred Background Template */}
                  <div
                    style={{
                      filter: 'blur(7px)',
                      opacity: 0.5,
                      userSelect: 'none',
                      pointerEvents: 'none',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      inset: 0,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        border: '6px double var(--border-bright)',
                        padding: '20px',
                        textAlign: 'center',
                        height: '100%',
                      }}
                    >
                      <h1 style={{ fontSize: '1.6rem', fontFamily: 'serif', color: 'var(--text-primary)' }}>
                        Certificate of Completion
                      </h1>
                      <p style={{ marginTop: '14px', fontSize: '0.9rem' }}>
                        This certifies that the intern has successfully completed their assigned tenure.
                      </p>
                      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-around' }}>
                        <div style={{ borderTop: '1px solid #000', width: '90px', paddingTop: '6px', fontSize: '0.8rem' }}>
                          Signature
                        </div>
                        <div style={{ borderTop: '1px solid #000', width: '90px', paddingTop: '6px', fontSize: '0.8rem' }}>
                          Date
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.94)',
                      padding: '24px 20px',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '380px',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'var(--accent-rose-soft)',
                        color: 'var(--accent-rose)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Lock size={26} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Content Locked
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Your completion certificate is currently locked and will be made available upon successful completion of your internship tenure.
                    </p>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', width: '100%', maxWidth: '140px' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Commission Policy - Fully Responsive & Structured */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Overview Hero Badge */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #e3fcef 0%, #deebff 100%)',
                      border: '1px solid #b3d4ff',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <TrendingUp size={18} color="var(--accent-emerald)" />
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#006644',
                        }}
                      >
                        Performance-Based Reward
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      5% to 15% Commission Rate
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                      Interns earn a commission ranging from <strong>5% to 15%</strong> based on lead quality, close-readiness, and deal success.
                    </p>
                  </div>

                  {/* Crucial Condition Alert */}
                  <div
                    style={{
                      background: '#fff0b3',
                      border: '1px solid #ffe380',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <AlertTriangle size={18} color="#974f0c" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.84rem', color: '#172b4d', lineHeight: 1.5 }}>
                      <strong>Important Closure Requirement:</strong> This commission is <strong>only paid on deals that are successfully closed</strong> — meaning the client has finalized the deal and full payment has been received. <em>Bringing in a lead alone does not qualify for any commission.</em>
                    </div>
                  </div>

                  {/* Commission Tiers Grid */}
                  <div>
                    <h4
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-secondary)',
                        marginBottom: '10px',
                      }}
                    >
                      Commission Tiers Breakdown
                    </h4>

                    <div className="commission-tiers-grid">
                      {/* Tier 1: 5% - 10% */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent-primary)',
                            }}
                          >
                            5% – 10%
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: 'var(--accent-blue-soft)',
                              color: 'var(--accent-primary)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                            }}
                          >
                            Standard
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          For standard performance, based on the quality and close-readiness of the leads brought in. The more qualifying leads that convert into actual closed deals, the higher the commission within this range.
                        </div>
                      </div>

                      {/* Tier 2: Up to 15% */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #abf5d1',
                          borderRadius: 'var(--radius-sm)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent-emerald)',
                            }}
                          >
                            Up to 15%
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: 'var(--accent-emerald-soft)',
                              color: 'var(--accent-emerald)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Sparkles size={10} /> Exceptional
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          For exceptional performance, where an intern consistently brings in high-potential leads that convert into paying customers, awarded at management&apos;s discretion as a reward for outstanding results.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ineligible Note */}
                  <div
                    style={{
                      background: 'var(--accent-rose-soft)',
                      border: '1px solid #ffbdad',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: '#bf2600',
                    }}
                  >
                    <CheckCircle2 size={15} style={{ flexShrink: 0, opacity: 0.8 }} />
                    <span>
                      <strong>Notice:</strong> Leads that do not close, or are low-quality / unqualified, will not earn any commission.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-subtle)',
                background: '#f4f5f7',
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '90px' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}