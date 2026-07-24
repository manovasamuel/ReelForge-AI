export const publishingMockData = {
  "bp_1": {
    metadata: {
      blueprintId: "bp_1",
      status: "Review",
      version: "v1.2",
      lastUpdated: "10 mins ago"
    },
    checklist: {
      content: [
        { id: "c1", label: "Blueprint Complete", status: "completed" },
        { id: "c2", label: "Assets Ready", status: "completed" },
        { id: "c3", label: "Captions Ready", status: "completed" }
      ],
      production: [
        { id: "p1", label: "Video Attached", status: "completed" },
        { id: "p2", label: "Thumbnail Ready", status: "pending" },
        { id: "p3", label: "Final Render", status: "pending" }
      ],
      compliance: [
        { id: "cm1", label: "Brand Approved", status: "completed" },
        { id: "cm2", label: "Client Approved", status: "pending" },
        { id: "cm3", label: "Copyright Check", status: "completed" }
      ]
    },
    approvals: [
      { id: "a1", role: "Creative Director", name: "Sarah J.", status: "Approved", date: "23 Jul 2026", notes: "Looks great, copy is tight." },
      { id: "a2", role: "Client", name: "Acme Corp", status: "Pending", date: null, notes: "Awaiting final review link." }
    ],
    distribution: [
      { id: "d1", platform: "Instagram", scheduledFor: "2026-08-01T10:00:00Z", status: "scheduled", timezone: "EST" },
      { id: "d2", platform: "LinkedIn", scheduledFor: null, status: "draft", timezone: "EST" },
      { id: "d3", platform: "YouTube", scheduledFor: null, status: "draft", timezone: "EST" }
    ],
    exportPackage: {
      items: [
        "Blueprint Script (PDF)",
        "Shot List (CSV)",
        "Production Notes (PDF)",
        "Platform Captions (TXT)",
        "Hashtags & Metadata (TXT)"
      ],
      size: "2.4 MB"
    }
  }
}
