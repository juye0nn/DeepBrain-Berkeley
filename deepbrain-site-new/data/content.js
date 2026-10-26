/* ==========================================================================
   DeepBrain — 사이트 내용 (이 파일만 고치면 사이트가 바뀌어요)
   --------------------------------------------------------------------------
   규칙 세 가지만 지키면 돼요.
     1. 글자는 항상 " " 따옴표 안에 쓰기. 글 안에 " 를 쓰고 싶으면 “ ” 를 쓰세요.
     2. 항목 사이에는 쉼표(,)를 넣기. 마지막 항목 뒤 쉼표는 있어도 없어도 돼요.
     3. 날짜는 "2026-10-14" 처럼 연-월-일로 쓰기.
   저장하고 다시 올린 뒤 사이트가 비어 보이면, 따옴표나 쉼표가 빠진 곳이 있는 거예요.
   ========================================================================== */

window.DEEPBRAIN_CONTENT = {

  /* ── 맨 위 요약 숫자 ───────────────────────────────────────────── */
  facts: [
    { label: "Projects",        value: "6 topics this fall" },
    { label: "General meeting", value: "Tuesdays 8pm" },
    { label: "Presentations",   value: "Early December" }
  ],

  /* ── 프로젝트 ─────────────────────────────────────────────────────
     하나 추가하려면 { ... } 블록 하나를 통째로 복사해서 붙여넣고 내용을 바꾸세요.
     linkText / linkUrl 은 없으면 비워 두세요 ("").
     tag 는 카드 오른쪽 위 작은 표시예요 (예: "Team-defined"). 없으면 "". */
  projectsHeading: "Fall 2026 projects",
  projectsNote: "6 topics · 6 spots each",
  projects: [
    {
      area: "Brain/AI alignment",
      title: "Predicting Brain Activity During Speech with Language Models",
      ideaBold: "Do AI language models handle language the way the brain does?",
      idea: "This topic compares what a model computes with signals recorded inside the brain.",
      project: "Sami's research covers decoding intracranial brain signals for clinical purposes, and encoding models: LLM/brain alignment for speech perception and working memory.",
      start: "The “Podcast” ECoG dataset: nine patients, 1,330 electrodes, one 30-minute podcast. Public, with tutorials and code.",
      linkText: "Dataset paper",
      linkUrl: "https://www.nature.com/articles/s41597-025-05462-2",
      tag: ""
    },
    {
      area: "Spinal cord interface",
      title: "Decoding Movement and Sensation from Spinal Cord Recordings",
      ideaBold: "Most neural interfaces target the brain.",
      idea: "A spinal cord interface is a bioelectronic device that works with the spinal cord instead.",
      project: "A possible collaboration with a bioelectronics group at Cambridge, through a contact of Sami's who works on spinal cord interfaces.",
      start: "The group's paper: a thin electrode array wraps around the spinal cord and decodes intended movement and sensory input.",
      linkText: "Device paper",
      linkUrl: "https://www.nature.com/articles/s41467-026-75128-z",
      tag: ""
    },
    {
      area: "Stereotactic accuracy",
      title: "Measuring Targeting Error in Brain Electrode Placement",
      ideaBold: "In stereotactic surgery, a surgeon guides an electrode or needle to an exact point in the brain.",
      idea: "This topic asks how accurate that placement is.",
      project: "One of Sami's ongoing projects as a neurosurgeon. It covers SEEG, deep brain stimulation (DBS) and biopsies.",
      start: "A chatbot on sciense.org that answers questions about high-precision stereotaxy.",
      linkText: "Stereotaxy chatbot",
      linkUrl: "https://www.sciense.org/sami/high-precision-stereotaxy?db=seeg",
      tag: ""
    },
    {
      area: "Consensus building",
      title: "Consensus on DBS and Brain-Computer Interfaces",
      ideaBold: "A field needs shared standards.",
      idea: "Consensus building is how large groups of experts agree on them, here for clinical neuroscience and neural interfaces.",
      project: "Neurocore: expert consensus from 100+ physician-scientists on brain and spine. The next rounds focus on neural interfaces, from DBS to BCI.",
      start: "Search PubMed for the Neurocore papers.",
      linkText: "PubMed search",
      linkUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=Neurocore",
      tag: ""
    },
    {
      area: "Clinical AI",
      title: "Testing the Safety and Usability of AI Decision Support in Neuroscience",
      ideaBold: "Clinical decision support systems are AI tools that help doctors decide what to do.",
      idea: "This topic looks at how they should work in neuroscience.",
      project: "Several ongoing projects on AI decision support, from three angles: alignment and safety, human-computer interaction, and how physicians and AI work together.",
      start: "An example paper on AI decision support in clinical neuroscience.",
      linkText: "Example paper",
      linkUrl: "https://pubmed.ncbi.nlm.nih.gov/40309809/",
      tag: ""
    },
    {
      area: "Brain imaging",
      title: "Open Brain Imaging Project",
      ideaBold: "Brain imaging covers MRI and other ways of looking at the brain.",
      idea: "This topic is open, so the project depends on what you want to do.",
      project: "No project is set yet. Tell us what you're specifically into and we will reach out to neuroradiology groups at UCSF.",
      start: "Write down the imaging methods or questions you care about and send them to us.",
      linkText: "",
      linkUrl: "",
      tag: "Team-defined"
    }
  ],

  /* ── How projects work (학기 단계) ─────────────────────────────────
     start / end 날짜로 "지금 어느 단계인지" 표시가 자동으로 움직여요. */
  phases: [
    { when: "October",        start: "2026-10-01", end: "2026-10-31", title: "Set a goal and learn", text: "Pick one concrete goal, such as a conference abstract, and read the background." },
    { when: "November",       start: "2026-11-01", end: "2026-11-30", title: "Do the work",          text: "Run the analysis, write the review or build the tool." },
    { when: "Early December", start: "2026-12-01", end: "2026-12-06", title: "Present",              text: "Final presentations before RRR week and finals." }
  ],
  phasesNote: "Each team picks its own lead and goal.",

  /* ── 주간 일정 ─────────────────────────────────────────────────── */
  schedule: [
    { when: "Tuesday 8pm",  title: "General meeting",                        text: "Announcements, then work time with your team." },
    { when: "Once a week",  title: "Extra team meeting, depending on teams", text: "For teams where someone can't make Tuesday." },
    { when: "Every day",    title: "Team Slack thread",                      text: "Post progress and questions." },
    { when: "Every Friday", title: "Team lead check-in",                     text: "Leads report to us: what we did, what's blocking us, what we need." }
  ],

  /* ── 모집 안내 ─────────────────────────────────────────────────────
     다음 학기 모집을 열 때: open 을 true 로 바꾸고, openTitle / openText /
     signupUrl 을 채우세요. 닫혀 있을 때는 closed... 문구가 보여요. */
  signup: {
    open: false,

    closedLabel: "Fall 2026 sign-ups are closed",
    closedTitle: "Stay tuned for next semester's update.",
    closedText:  "Teams for this semester are set and the work is under way. Thank you to everyone who signed up. We will post next semester's projects and sign-up details here, so check back soon.",

    openLabel:   "Sign-ups open",
    openTitle:   "Join DeepBrain this semester",
    openText:    "Add your name next to the topic you want in the sign-up sheet.",
    signupUrl:   "",
    signupButton:"Open the sign-up sheet"
  },

  /* ── 문의 ──────────────────────────────────────────────────────── */
  contact: "Email Juyeon or Risha, or post in Slack."
};
