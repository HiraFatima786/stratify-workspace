'use client';

import React, { useState } from 'react';
import { Lock, Award, DollarSign, X } from 'lucide-react';

export default function LockedInfoPanels() {
  const [activeModal, setActiveModal] = useState<'certificate' | 'commission' | null>(null);

  const commissionText = `Intern Commission Policy

Interns will earn a commission ranging from 5% to 10%, based on performance. This commission is only paid on deals that are successfully closed — meaning the client has finalized the deal and payment has been received. Bringing in a lead alone does not qualify for any commission.

The commission percentage depends on the quality and success rate of the leads an intern brings in. The more qualifying, close-ready leads an intern brings — and the more of those leads convert into actual closed deals — the higher their commission percentage will be, up to a maximum of 10%. Leads that do not close, or are low-quality/unqualified, will not earn any commission.`;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Certificate Panel */}
        <div
          onClick={() => setActiveModal('certificate')}
          className="glass-panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
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
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--accent-blue-soft)', color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Completion Certificate</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click to view your certificate status</p>
          </div>
        </div>

        {/* Commission Panel */}
        <div
          onClick={() => setActiveModal('commission')}
          className="glass-panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
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
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--accent-emerald-soft)', color: 'var(--accent-emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Commission Distribution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>View commission policy and details</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 30, 66, 0.54)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }} onClick={() => setActiveModal(null)}>
          <div
            className="glass-panel"
            style={{
              width: '100%', maxWidth: '600px', background: '#ffffff',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              position: 'relative', display: 'flex', flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f4f5f7'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeModal === 'certificate' ? <><Award size={20} color="var(--accent-primary)" /> Completion Certificate</> : <><DollarSign size={20} color="var(--accent-emerald)" /> Commission Distribution</>}
              </h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              
              {activeModal === 'certificate' ? (
                <>
                  {/* Blurred Background Content */}
                  <div style={{
                    filter: 'blur(8px)', opacity: 0.6, userSelect: 'none', pointerEvents: 'none',
                    width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, padding: '32px',
                    display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden'
                  }}>
                    <div style={{ border: '8px double var(--border-bright)', padding: '24px', textAlign: 'center', height: '100%' }}>
                      <h1 style={{ fontSize: '2rem', fontFamily: 'serif', color: 'var(--text-primary)' }}>Certificate of Completion</h1>
                      <p style={{ marginTop: '20px' }}>This is to certify that the intern has successfully completed their tenure.</p>
                      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-around' }}>
                        <div style={{ borderTop: '1px solid #000', width: '100px', paddingTop: '8px' }}>Signature</div>
                        <div style={{ borderTop: '1px solid #000', width: '100px', paddingTop: '8px' }}>Date</div>
                      </div>
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  <div style={{
                    position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.9)', padding: '24px 32px', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center',
                    maxWidth: '80%'
                  }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-rose-soft)',
                      color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <Lock size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Content Locked</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Your completion certificate is currently locked and will be available upon successful completion of your internship.
                    </p>
                    <button onClick={() => setActiveModal(null)} className="btn btn-primary" style={{ marginTop: '20px' }}>
                      Close
                    </button>
                  </div>
                </>
              ) : (
                /* Commission Note - Fully Visible */
                <div style={{ width: '100%', textAlign: 'left', background: '#f4f5f7', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    {commissionText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}