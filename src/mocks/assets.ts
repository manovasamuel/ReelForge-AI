export const assetMockData = {
  "bp_1": {
    metadata: {
      blueprintId: "bp_1",
      status: "Planning",
      lastUpdated: "1 hour ago",
      generatedByAI: true
    },
    shotList: [
      {
        id: "shot_1",
        scene: "1",
        shotNumber: "1",
        type: "A-Roll",
        framing: "Medium Close-Up",
        movement: "Static",
        duration: "5s",
        dialogue: "You're spending 10 hours a week managing your content system, and you're still not growing.",
        action: "Looking directly into lens, serious expression. Holding a smartphone.",
        equipment: "Main Camera, 35mm Lens, Key Light",
        status: "Planned"
      },
      {
        id: "shot_2",
        scene: "1",
        shotNumber: "2",
        type: "B-Roll",
        framing: "Over the Shoulder",
        movement: "Slow Dolly In",
        duration: "3s",
        dialogue: "",
        action: "Typing furiously on a messy Notion dashboard on laptop.",
        equipment: "B-Cam, 50mm Lens",
        status: "Planned"
      },
      {
        id: "shot_3",
        scene: "2",
        shotNumber: "3",
        type: "A-Roll",
        framing: "Medium Close-Up",
        movement: "Static",
        duration: "4s",
        dialogue: "Here is exactly how to reclaim that time.",
        action: "Slight smile, pointing down towards the CTA.",
        equipment: "Main Camera, 35mm Lens",
        status: "Planned"
      },
      {
        id: "shot_4",
        scene: "3",
        shotNumber: "4",
        type: "B-Roll",
        framing: "Close-Up",
        movement: "Handheld",
        duration: "3s",
        dialogue: "",
        action: "Clean, organized ReelForge dashboard replacing the messy Notion setup.",
        equipment: "Screen Recording",
        status: "Planned"
      }
    ],
    visualReferences: [
      {
        id: "ref_1",
        category: "Lighting",
        url: "/images/moodboard-lighting.jpg", // We'll use placeholders or colored blocks since we lack images
        notes: "High contrast, moody background. Teal and orange cinematic grade.",
        relatedShot: "Scene 1",
        source: "AI Generated"
      },
      {
        id: "ref_2",
        category: "Framing",
        url: "/images/moodboard-framing.jpg",
        notes: "Rule of thirds. Subject slightly right of center to leave room for graphics.",
        relatedShot: "Scene 1, Shot 1",
        source: "Reference Video"
      }
    ],
    productionNotes: {
      camera: [
        { label: "Resolution", value: "4K (3840x2160)" },
        { label: "FPS", value: "30fps (A-Roll), 60fps (B-Roll for slow mo)" },
        { label: "Lens", value: "35mm for A-Roll, 50mm/85mm for B-Roll" },
        { label: "Framing", value: "Vertical (9:16) safe zones." }
      ],
      audio: [
        { label: "Microphone", value: "Lavalier mic hidden under shirt." },
        { label: "Environment", value: "Turn off AC to reduce room tone." },
        { label: "Backup Recording", value: "Shotgun mic on boom pole." }
      ],
      lighting: [
        { label: "Key Light", value: "Large softbox, 45 degrees left." },
        { label: "Fill Light", value: "Negative fill on right side." },
        { label: "Background", value: "Practical lamp (warm orange)." }
      ],
      editing: [
        { label: "Transitions", value: "Fast J-cuts. Audio leads the video." },
        { label: "Motion Graphics", value: "Bold, yellow text highlighting key words." },
        { label: "Color Grade", value: "Rec709 with slight desaturation in shadows." },
        { label: "Music", value: "Lo-Fi subtle beat (100 BPM)." },
        { label: "Sound Effects", value: "Whoosh on B-Roll transitions." }
      ]
    }
  }
}
