/* ==========================================================================
   DeepBrain — member database
   --------------------------------------------------------------------------
   THIS IS THE FILE YOU EDIT WHEN THE ROSTER CHANGES.

   You do not have to hand-edit it. Open the site, go to Admin, make your
   changes in the table, hit "Export", and paste the result over everything
   below. That is the whole workflow.

   Each member needs, at minimum, a `name` and an `email`. Everything else
   is optional and only shows up in your Admin console.

     id      a short unique code. The Admin console makes these for you.
     name    the name they will type when they log in. Word order does not
             matter — "Juyeon Jeon" and "Jeon Juyeon" both work.
     email   their @berkeley.edu address. This is what actually matches.
     role    "member" | "officer" | "lead" | "mentor"   (your label, free text)
     cohort  e.g. "Fall 2026"
     status  "active" | "pending" | "alumni"
             Only `active` members can sign in.
     joined  YYYY-MM-DD
     notes   anything you want to remember. Officers only ever see this.

   PRIVACY — read this before you push the site to a public repo.
   This file ships with the website, so anyone who views the site can read
   it. Two safe options:
     1. Keep the repository private, or
     2. In the Admin console click "Protect emails". Each `email` is
        replaced with a one-way `emailHash` plus a masked preview. Sign-in
        still works exactly the same, but the addresses are no longer
        readable by anyone who opens the file.
   ========================================================================== */

window.DEEPBRAIN_ROSTER = {
  /* Shown in the Admin console so you know how fresh the list is. */
  updated: "2026-09-16",

  /* The word an officer types to open the Admin console. Change it.
     It is not real security — it only keeps the console out of the way of
     ordinary visitors. See README.md → "What the sign-in actually does". */
  adminKey: "deepbrain-officers",

  members: [
    {
      id: "db-0001",
      name: "Juyeon Jeon",
      emailHash: "3d9b1efba9419bed5779b06a1cc2deda9de76d312be7ef24a12dcd7d864c7757",
      emailMasked: "j••••••6@berkeley.edu",
      role: "officer",
      cohort: "Fall 2026",
      status: "active",
      joined: "2026-09-01",
      notes: "Administrative officer — maintains this roster."
    },
    {
      id: "db-0002",
      name: "Example Member",
      emailHash: "c61f5b700c0ab2c8c816b307dca18f5c192c6f379fec94377ba5cc546b1f39b7",
      emailMasked: "e••••••r@berkeley.edu",
      role: "member",
      cohort: "Fall 2026",
      status: "active",
      joined: "2026-09-15",
      notes: "Sample row — delete this once you add real members."
    },
    {
      id: "db-0003",
      name: "Pending Signup",
      emailHash: "67ae8a1d6c8a08e222e56742751d0dbe46256b6727569d262c00087b7ca1bbb1",
      emailMasked: "p••••••p@berkeley.edu",
      role: "member",
      cohort: "Fall 2026",
      status: "pending",
      joined: "2026-09-15",
      notes: "Sample row — 'pending' members cannot sign in yet."
    }
  ]
};
