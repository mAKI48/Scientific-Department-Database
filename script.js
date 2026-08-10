/* ==================================================
   SCD SCIENTIFIC DATABASE
   Supabase + Admin Panel
   ================================================== */


/* ==================================================
   SUPABASE
   ================================================== */

const SUPABASE_URL =
  "https://hytqegmmwlvnyeraytec.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PjiITaK5ILnagliukxereA_9fhwO-jO";


const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* ==================================================
   ADMIN
   ================================================== */

const ADMIN_UID =
  "1da022eb-e2cc-47a7-bf2a-a1762c638467";


let currentUser =
  null;

let isAdmin =
  false;


/* ==================================================
   STATE
   ================================================== */

const state = {

  scps: [],

  tests: [],

  incidents: [],

  personnel: [],

  documents: []

};


/* ==================================================
   SECURITY
   ================================================== */

function escapeHTML(value) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ==================================================
   START
   ================================================== */

document.addEventListener(
  "DOMContentLoaded",
  start
);


async function start() {

  setupNavigation();

  setupSearch();

  setupReportClose();

  setupTheme();

  await checkAuth();

  await loadData();

}


/* ==================================================
   AUTH
   ================================================== */

async function checkAuth() {

  const {
    data,
    error
  } =
    await db.auth.getSession();


  if (error) {

    console.error(error);

    return;

  }


  currentUser =
    data.session
      ? data.session.user
      : null;


  updateAdminState();


  db.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {

      currentUser =
        session
          ? session.user
          : null;

      updateAdminState();

      await loadData();

    }
  );

}


/* ==================================================
   ADMIN STATE
   ================================================== */

function updateAdminState() {

  isAdmin =
    !!currentUser &&
    currentUser.id === ADMIN_UID;


  const adminPanel =
    document.getElementById(
      "admin-panel"
    );


  const loginButton =
    document.getElementById(
      "admin-login-button"
    );


  const logoutButton =
    document.getElementById(
      "admin-logout-button"
    );


  if (adminPanel) {

    adminPanel.classList.toggle(
      "hidden",
      !isAdmin
    );

  }


  if (loginButton) {

    loginButton.classList.toggle(
      "hidden",
      !!currentUser
    );

  }


  if (logoutButton) {

    logoutButton.classList.toggle(
      "hidden",
      !currentUser
    );

  }


  renderPersonnel();

}


/* ==================================================
   ADMIN LOGIN
   ================================================== */

async function adminLogin() {

  const emailInput =
    document.getElementById(
      "admin-email"
    );

  const passwordInput =
    document.getElementById(
      "admin-password"
    );


  if (!emailInput || !passwordInput) {

    alert(
      "Admin login fields are missing from index.html."
    );

    return;

  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


  if (!email || !password) {

    alert(
      "Enter your email and password."
    );

    return;

  }


  const {
    data,
    error
  } =
    await db.auth.signInWithPassword({

      email,

      password

    });


  if (error) {

    alert(
      "LOGIN FAILED: " +
      error.message
    );

    return;

  }


  if (
    data.user.id !==
    ADMIN_UID
  ) {

    await db.auth.signOut();

    alert(
      "ACCESS DENIED: This account is not an administrator."
    );

    return;

  }


  alert(
    "ADMIN ACCESS GRANTED."
  );

}


/* ==================================================
   ADMIN LOGOUT
   ================================================== */

async function adminLogout() {

  await db.auth.signOut();

  alert(
    "Logged out."
  );

}


/* ==================================================
   LOAD DATABASE
   ================================================== */

async function loadData() {

  try {

    const [

      scps,

      tests,

      incidents,

      personnel

    ] =
      await Promise.all([

        db
          .from("scps")
          .select("*"),

        db
          .from("tests")
          .select("*"),

        db
          .from("incidents")
          .select("*"),

        db
          .from("personnel")
          .select("*")

      ]);


    if (scps.error)
      throw scps.error;

    if (tests.error)
      throw tests.error;

    if (incidents.error)
      throw incidents.error;

    if (personnel.error)
      throw personnel.error;


    state.scps =
      scps.data || [];


    state.tests =
      tests.data || [];


    state.incidents =
      incidents.data || [];


    state.personnel =
      personnel.data || [];


    renderAll();


    const updated =
      document.getElementById(
        "updated"
      );


    if (updated) {

      updated.textContent =
        " | DATABASE LOADED: " +
        new Date()
          .toLocaleDateString();

    }

  }

  catch (error) {

    console.error(
      "DATABASE ERROR:",
      error
    );


    const box =
      document.getElementById(
        "error"
      );


    if (box) {

      box.classList.remove(
        "hidden"
      );


      box.textContent =
        "DATABASE ERROR: " +
        error.message;

    }

  }

}


/* ==================================================
   RENDER ALL
   ================================================== */

function renderAll() {

  renderStats();

  renderRecent();

  renderSCPs();

  renderTests();

  renderIncidents();

  renderPersonnel();

  renderDocuments();

}


/* ==================================================
   STATS
   ================================================== */

function renderStats() {

  const stats =
    document.getElementById(
      "stats"
    );


  if (!stats)
    return;


  stats.innerHTML = `

    <div class="stat">
      <strong>${state.scps.length}</strong>
      <span>SCP FILES</span>
    </div>

    <div class="stat">
      <strong>${state.tests.length}</strong>
      <span>TEST REPORTS</span>
    </div>

    <div class="stat">
      <strong>${state.incidents.length}</strong>
      <span>INCIDENTS</span>
    </div>

    <div class="stat">
      <strong>${state.personnel.length}</strong>
      <span>PERSONNEL</span>
    </div>

  `;

}


/* ==================================================
   RECENT TESTS
   ================================================== */

function renderRecent() {

  const box =
    document.getElementById(
      "recent-tests"
    );


  if (!box)
    return;


  const tests =
    [...state.tests]
      .slice(-3)
      .reverse();


  box.innerHTML =
    tests.length

      ?

      tests
        .map(testCompact)
        .join("")

      :

      empty(
        "No test reports filed."
      );

}


function testCompact(t) {

  const index =
    state.tests.indexOf(t);


  return `

    <div
      class="compact-record test-card"
      onclick="openTest(${index})"
    >

      <b>
        ${escapeHTML(t.test_number)}
      </b>

      <span>
        ${escapeHTML(t.scp)}
        —
        ${escapeHTML(t.scientist)}
      </span>

      <small>
        ${escapeHTML(t.date)}
        |
        ${escapeHTML(t.outcome)}
      </small>

    </div>

  `;

}


/* ==================================================
   SCP FILES
   ================================================== */

function renderSCPs(
  filter = ""
) {

  const box =
    document.getElementById(
      "scp-list"
    );


  if (!box)
    return;


  const q =
    filter
      .toLowerCase()
      .trim();


  const records =
    state.scps.filter(
      s => `

        ${s.number}
        ${s.name}
        ${s.object_class}
        ${s.risk_class}
        ${s.containment_zone}
        ${s.description}

      `
        .toLowerCase()
        .includes(q)
    );


  box.innerHTML =

    records.length

      ?

      records
        .map(scpCard)
        .join("")

      :

      empty(
        "No SCP files found."
      );

}


function scpCard(s) {

  const index =
    state.scps.indexOf(s);


  return `

    <article
      class="record scp-card"
      onclick="openSCP(${index})"
    >

      <div class="record-head">

        <h3>

          ${escapeHTML(s.number)}

          —

          ${escapeHTML(s.name)}

        </h3>

        <span class="tag">

          ${escapeHTML(
            s.object_class
          )}

        </span>

      </div>


      <div class="meta">

        Risk:
        ${escapeHTML(s.risk_class)}

        |

        Zone:
        ${escapeHTML(
          s.containment_zone
        )}

      </div>


      <p>

        ${escapeHTML(
          s.description
        )}

      </p>


      <div class="record-foot">

        Clearance:
        Level
        ${escapeHTML(
          s.clearance
        )}

      </div>


      <div class="click-hint">

        CLICK TO VIEW FULL SCP FILE

      </div>

    </article>

  `;

}


/* ==================================================
   OPEN SCP
   ================================================== */

function openSCP(index) {

  const s =
    state.scps[index];


  if (!s)
    return;


  document
    .getElementById(
      "report-content"
    )
    .innerHTML = `

      <div class="report-header">

        <div>

          <div class="classification">
            SCIENTIFIC DEPARTMENT
          </div>

          <h2>

            ${escapeHTML(s.number)}

            —

            ${escapeHTML(s.name)}

          </h2>

        </div>

        <span class="tag">

          ${escapeHTML(
            s.object_class
          )}

        </span>

      </div>


      <div class="report-meta">

        <span>

          <strong>
            Object Class:
          </strong>

          ${escapeHTML(
            s.object_class
          )}

        </span>


        <span>

          <strong>
            Risk Class:
          </strong>

          ${escapeHTML(
            s.risk_class
          )}

        </span>


        <span>

          <strong>
            Clearance:
          </strong>

          Level
          ${escapeHTML(
            s.clearance
          )}

        </span>

      </div>


      <div class="report-section">

        <h3>
          CONTAINMENT ZONE
        </h3>

        <p>

          ${escapeHTML(
            s.containment_zone
          )}

        </p>

      </div>


      <div class="report-section">

        <h3>
          DESCRIPTION
        </h3>

        <p>

          ${escapeHTML(
            s.description
          )}

        </p>

      </div>


      <div class="report-section">

        <h3>
          SCP IDENTIFICATION
        </h3>

        <p>

          ${escapeHTML(
            s.number
          )}

        </p>

      </div>

    `;


  openReport();

}


/* ==================================================
   TEST REPORTS
   ================================================== */

function renderTests(
  filter = ""
) {

  const box =
    document.getElementById(
      "test-list"
    );


  if (!box)
    return;


  const q =
    filter
      .toLowerCase()
      .trim();


  const records =
    state.tests.filter(
      t => `

        ${t.test_number}
        ${t.scp}
        ${t.scientist}
        ${t.question}
        ${t.outcome}
        ${t.results}
        ${t.research_notes}
        ${t.conclusion}

      `
        .toLowerCase()
        .includes(q)
    );


  box.innerHTML =

    records.length

      ?

      records
        .map(
          t =>
            testCard(
              t,
              state.tests.indexOf(t)
            )
        )
        .join("")

      :

      empty(
        "No test reports found."
      );

}


function testCard(
  t,
  index
) {

  return `

    <article
      class="record test-card"
      onclick="openTest(${index})"
    >

      <div class="record-head">

        <h3>

          ${escapeHTML(
            t.test_number
          )}

          —

          ${escapeHTML(
            t.scp
          )}

        </h3>


        <span class="tag">

          ${escapeHTML(
            t.outcome
          )}

        </span>

      </div>


      <div class="meta">

        ${escapeHTML(
          t.date
        )}

        |

        Scientist:
        ${escapeHTML(
          t.scientist
        )}

        |

        Clearance:
        ${escapeHTML(
          t.clearance
        )}

      </div>


      <p>

        <strong>
          Question:
        </strong>

        ${escapeHTML(
          t.question
        )}

      </p>


      <div class="click-hint">

        CLICK TO VIEW FULL TEST REPORT

      </div>

    </article>

  `;

}


/* ==================================================
   OPEN TEST
   ================================================== */

function openTest(index) {

  const t =
    state.tests[index];


  if (!t)
    return;


  document
    .getElementById(
      "report-content"
    )
    .innerHTML = `

      <div class="report-header">

        <div>

          <div class="classification">
            SCIENTIFIC DEPARTMENT
          </div>

          <h2>

            ${escapeHTML(
              t.test_number
            )}

            —

            ${escapeHTML(
              t.scp
            )}

          </h2>

        </div>


        <span class="tag">

          ${escapeHTML(
            t.outcome
          )}

        </span>

      </div>


      <div class="report-meta">

        <span>
          <strong>Date:</strong>
          ${escapeHTML(t.date)}
        </span>

        <span>
          <strong>Scientist:</strong>
          ${escapeHTML(t.scientist)}
        </span>

        <span>
          <strong>Clearance:</strong>
          ${escapeHTML(t.clearance)}
        </span>

      </div>


      ${reportSection(
        "QUESTION",
        t.question
      )}


      ${reportSection(
        "HYPOTHESIS",
        t.hypothesis
      )}


      ${reportSection(
        "TEST LOG",
        t.log,
        true
      )}


      ${reportSection(
        "RESULTS",
        t.results
      )}


      ${reportSection(
        "RESEARCH NOTES",
        t.research_notes ||
        "No research notes attached."
      )}


      ${reportSection(
        "CONCLUSION",
        t.conclusion ||
        "No conclusion recorded."
      )}


      ${reportSection(
        "SCIENTIST NOTE",
        t.scientist_note ||
        "No scientist note recorded."
      )}


      <div class="report-footer">

        <span>

          <strong>
            Casualties:
          </strong>

          ${escapeHTML(
            t.casualties ||
            "None recorded"
          )}

        </span>


        <span>

          <strong>
            Follow-up:
          </strong>

          ${escapeHTML(
            t.follow_up ||
            "None recorded"
          )}

        </span>

      </div>

    `;


  openReport();

}


/* ==================================================
   REPORT SECTION
   ================================================== */

function reportSection(
  title,
  value,
  log = false
) {

  return `

    <div class="report-section">

      <h3>
        ${escapeHTML(title)}
      </h3>

      ${
        log

          ?

          `<div class="report-log">
            ${escapeHTML(value)}
          </div>`

          :

          `<p>
            ${escapeHTML(value)}
          </p>`
      }

    </div>

  `;

}


/* ==================================================
   INCIDENTS
   ================================================== */

function renderIncidents() {

  const box =
    document.getElementById(
      "incident-list"
    );


  if (!box)
    return;


  box.innerHTML =

    state.incidents.length

      ?

      state.incidents
        .slice()
        .reverse()
        .map(
          incident => {

            const index =
              state.incidents.indexOf(
                incident
              );


            return `

              <article
                class="record incident-card"
                onclick="openIncident(${index})"
              >

                <div class="record-head">

                  <h3>

                    ${escapeHTML(
                      incident.incident_id ||
                      incident.id
                    )}

                    —

                    ${escapeHTML(
                      incident.title
                    )}

                  </h3>


                  <span class="tag">

                    ${escapeHTML(
                      incident.status
                    )}

                  </span>

                </div>


                <div class="meta">

                  ${escapeHTML(
                    incident.date
                  )}

                  |

                  ${escapeHTML(
                    incident.location
                  )}

                  |

                  SCP:
                  ${escapeHTML(
                    incident.scp
                  )}

                </div>


                <p>

                  <strong>
                    Summary:
                  </strong>

                  ${escapeHTML(
                    incident.summary
                  )}

                </p>


                <div class="click-hint">

                  CLICK TO VIEW FULL INCIDENT REPORT

                </div>

              </article>

            `;

          }
        )
        .join("")

      :

      empty(
        "No incident reports found."
      );

}


/* ==================================================
   OPEN INCIDENT
   ================================================== */

function openIncident(index) {

  const i =
    state.incidents[index];


  if (!i)
    return;


  document
    .getElementById(
      "report-content"
    )
    .innerHTML = `

      <div class="report-header">

        <div>

          <div class="classification">
            SCIENTIFIC DEPARTMENT
          </div>

          <h2>

            ${escapeHTML(
              i.incident_id ||
              i.id
            )}

            —

            ${escapeHTML(
              i.title
            )}

          </h2>

        </div>


        <span class="tag">

          ${escapeHTML(
            i.status
          )}

        </span>

      </div>


      <div class="report-meta">

        <span>

          <strong>
            Date:
          </strong>

          ${escapeHTML(
            i.date
          )}

        </span>


        <span>

          <strong>
            Location:
          </strong>

          ${escapeHTML(
            i.location
          )}

        </span>


        <span>

          <strong>
            SCP:
          </strong>

          ${escapeHTML(
            i.scp
          )}

        </span>

      </div>


      ${reportSection(
        "SUMMARY",
        i.summary
      )}


      ${reportSection(
        "PERSONNEL INVOLVED",
        i.personnel
      )}


      ${reportSection(
        "CASUALTIES",
        i.casualties
      )}


      ${reportSection(
        "RESOLUTION",
        i.resolution
      )}

    `;


  openReport();

}


/* ==================================================
   OPEN / CLOSE REPORT
   ================================================== */

function openReport() {

  const overlay =
    document.getElementById(
      "report-overlay"
    );


  if (!overlay)
    return;


  overlay.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";

}


function closeReport() {

  const overlay =
    document.getElementById(
      "report-overlay"
    );


  if (!overlay)
    return;


  overlay.classList.remove(
    "open"
  );


  document.body.style.overflow =
    "";

}


/* ==================================================
   PERSONNEL
   ================================================== */

function renderPersonnel() {

  const box =
    document.getElementById(
      "personnel-list"
    );


  if (!box)
    return;


  /*
   * Personnel is kept in database order.
   * The ▲ / ▼ buttons allow admins to change
   * that order.
   */


  box.innerHTML =

    state.personnel.length

      ?

      state.personnel
        .map(
          (
            p,
            index
          ) => `

            <article
              class="record personnel-record"
            >

              <div class="record-head">

                <h3>

                  ${escapeHTML(
                    p.name
                  )}

                </h3>


                <span class="tag">

                  LEVEL
                  ${escapeHTML(
                    p.clearance
                  )}

                </span>

              </div>


              <div class="meta">

                ${escapeHTML(
                  p.rank
                )}

                |

                ${escapeHTML(
                  p.department
                )}

              </div>


              <p>

                Tests conducted:

                ${escapeHTML(
                  p.tests_conducted
                )}

              </p>


              <p>

                Status:

                ${escapeHTML(
                  p.status
                )}

              </p>


              ${
                isAdmin

                  ?

                  `

                    <div class="admin-personnel-controls">

                      <button
                        type="button"
                        onclick="movePersonnelUp(${index}); event.stopPropagation();"
                        ${index === 0 ? "disabled" : ""}
                      >
                        ▲
                      </button>


                      <button
                        type="button"
                        onclick="movePersonnelDown(${index}); event.stopPropagation();"
                        ${index === state.personnel.length - 1 ? "disabled" : ""}
                      >
                        ▼
                      </button>


                      <button
                        type="button"
                        onclick="editPersonnel(${index}); event.stopPropagation();"
                      >
                        EDIT
                      </button>


                      <button
                        type="button"
                        onclick="deletePersonnel(${index}); event.stopPropagation();"
                      >
                        DELETE
                      </button>

                    </div>

                  `

                  :

                  ""

              }

            </article>

          `
        )
        .join("")

      :

      empty(
        "No personnel records found."
      );

}


/* ==================================================
   MOVE PERSONNEL UP
   ================================================== */

async function movePersonnelUp(
  index
) {

  if (!isAdmin)
    return;


  if (index <= 0)
    return;


  const current =
    state.personnel[index];

  const previous =
    state.personnel[index - 1];


  const currentId =
    current.id;

  const previousId =
    previous.id;


  /*
   * We use an "order_index" column if
   * your personnel table has one.
   *
   * If it doesn't exist, the UI can still
   * reorder locally, but database persistence
   * will fail until that column exists.
   */


  const currentOrder =
    index - 1;

  const previousOrder =
    index;


  const firstUpdate =
    await db
      .from("personnel")
      .update({
        order_index:
          currentOrder
      })
      .eq(
        "id",
        currentId
      );


  if (firstUpdate.error) {

    alert(
      "Personnel ordering needs an order_index column in the personnel table.\n\n" +
      firstUpdate.error.message
    );

    return;

  }


  const secondUpdate =
    await db
      .from("personnel")
      .update({
        order_index:
          previousOrder
      })
      .eq(
        "id",
        previousId
      );


  if (secondUpdate.error) {

    alert(
      secondUpdate.error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   MOVE PERSONNEL DOWN
   ================================================== */

async function movePersonnelDown(
  index
) {

  if (!isAdmin)
    return;


  if (
    index >=
    state.personnel.length - 1
  )
    return;


  const current =
    state.personnel[index];

  const next =
    state.personnel[index + 1];


  const firstUpdate =
    await db
      .from("personnel")
      .update({
        order_index:
          index + 1
      })
      .eq(
        "id",
        current.id
      );


  if (firstUpdate.error) {

    alert(
      "Personnel ordering needs an order_index column in the personnel table.\n\n" +
      firstUpdate.error.message
    );

    return;

  }


  const secondUpdate =
    await db
      .from("personnel")
      .update({
        order_index:
          index
      })
      .eq(
        "id",
        next.id
      );


  if (secondUpdate.error) {

    alert(
      secondUpdate.error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   PERSONNEL EDIT
   ================================================== */

async function editPersonnel(
  index
) {

  if (!isAdmin)
    return;


  const p =
    state.personnel[index];


  if (!p)
    return;


  const name =
    prompt(
      "Name:",
      p.name
    );


  if (name === null)
    return;


  const rank =
    prompt(
      "Rank:",
      p.rank
    );


  if (rank === null)
    return;


  const clearance =
    prompt(
      "Clearance:",
      p.clearance
    );


  if (clearance === null)
    return;


  const department =
    prompt(
      "Department:",
      p.department
    );


  if (department === null)
    return;


  const tests =
    prompt(
      "Tests conducted:",
      p.tests_conducted
    );


  if (tests === null)
    return;


  const status =
    prompt(
      "Status:",
      p.status
    );


  if (status === null)
    return;


  const {
    error
  } =
    await db
      .from("personnel")
      .update({

        name,

        rank,

        clearance,

        department,

        tests_conducted:
          tests,

        status

      })
      .eq(
        "id",
        p.id
      );


  if (error) {

    alert(
      "Could not update personnel:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   PERSONNEL DELETE
   ================================================== */

async function deletePersonnel(
  index
) {

  if (!isAdmin)
    return;


  const p =
    state.personnel[index];


  if (!p)
    return;


  if (
    !confirm(
      `Delete personnel record "${p.name}"?`
    )
  )
    return;


  const {
    error
  } =
    await db
      .from("personnel")
      .delete()
      .eq(
        "id",
        p.id
      );


  if (error) {

    alert(
      "Could not delete personnel:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   DOCUMENTS
   ================================================== */

function renderDocuments() {

  const box =
    document.getElementById(
      "document-list"
    );


  if (!box)
    return;


  /*
   * Documents are intentionally left as
   * Google Doc links / existing HTML data.
   */

  if (!state.documents.length) {

    box.innerHTML =
      empty(
        "Documents are maintained separately."
      );

    return;

  }


  box.innerHTML =
    state.documents
      .map(
        d => `

          <article class="record">

            <div class="record-head">

              <h3>

                ${escapeHTML(
                  d.id
                )}

                —

                ${escapeHTML(
                  d.title
                )}

              </h3>


              <span class="tag">

                ${escapeHTML(
                  d.type
                )}

              </span>

            </div>


            <div class="meta">

              Clearance:
              ${escapeHTML(
                d.clearance
              )}

              |

              Updated:
              ${escapeHTML(
                d.updated
              )}

            </div>


            <p>

              ${escapeHTML(
                d.description
              )}

            </p>


            ${
              d.url

                ?

                `

                  <a
                    class="document-link"
                    href="${escapeHTML(d.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >

                    OPEN DOCUMENT ↗

                  </a>

                `

                :

                ""

            }

          </article>

        `
      )
      .join("");

}


/* ==================================================
   EMPTY
   ================================================== */

function empty(
  message
) {

  return `

    <div class="empty">

      ${escapeHTML(
        message
      )}

    </div>

  `;

}


/* ==================================================
   NAVIGATION
   ================================================== */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".nav-button"
              )
              .forEach(
                b =>
                  b.classList.remove(
                    "active"
                  )
              );


            document
              .querySelectorAll(
                ".page"
              )
              .forEach(
                p =>
                  p.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );


            const page =
              document.getElementById(
                button.dataset.section
              );


            if (page) {

              page.classList.add(
                "active"
              );

            }


            window.scrollTo({

              top: 0,

              behavior: "smooth"

            });

          }
        );

      }
    );

}


/* ==================================================
   SEARCH
   ================================================== */

function setupSearch() {

  const scpSearch =
    document.getElementById(
      "scp-search"
    );


  if (scpSearch) {

    scpSearch.addEventListener(
      "input",
      e =>
        renderSCPs(
          e.target.value
        )
    );

  }


  const testSearch =
    document.getElementById(
      "test-search"
    );


  if (testSearch) {

    testSearch.addEventListener(
      "input",
      e =>
        renderTests(
          e.target.value
        )
    );

  }

}


/* ==================================================
   REPORT CLOSE
   ================================================== */

function setupReportClose() {

  const button =
    document.getElementById(
      "report-close"
    );


  if (button) {

    button.addEventListener(
      "click",
      closeReport
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeReport();

      }

    }
  );

}


/* ==================================================
   THEME
   ================================================== */

function setTheme(
  theme
) {

  if (
    theme ===
    "light"
  ) {

    document.body
      .classList
      .add(
        "light-mode"
      );


    localStorage.setItem(
      "scd-theme",
      "light"
    );

  }

  else {

    document.body
      .classList
      .remove(
        "light-mode"
      );


    localStorage.setItem(
      "scd-theme",
      "dark"
    );

  }

}


/* ==================================================
   THEME SETUP
   ================================================== */

function setupTheme() {

  const darkButton =
    document.getElementById(
      "dark-mode-button"
    );


  const lightButton =
    document.getElementById(
      "light-mode-button"
    );


  if (darkButton) {

    darkButton.addEventListener(
      "click",
      () =>
        setTheme("dark")
    );

  }


  if (lightButton) {

    lightButton.addEventListener(
      "click",
      () =>
        setTheme("light")
    );

  }


  const savedTheme =
    localStorage.getItem(
      "scd-theme"
    );


  if (
    savedTheme ===
    "light"
  ) {

    setTheme("light");

  }

  else {

    setTheme("dark");

  }

}


/* ==================================================
   GLOBAL FUNCTIONS
   ==================================================

   These are attached to window because
   the generated HTML uses onclick="..."
   ================================================== */

window.openSCP =
  openSCP;

window.openTest =
  openTest;

window.openIncident =
  openIncident;

window.closeReport =
  closeReport;

window.adminLogin =
  adminLogin;

window.adminLogout =
  adminLogout;

window.movePersonnelUp =
  movePersonnelUp;

window.movePersonnelDown =
  movePersonnelDown;

window.editPersonnel =
  editPersonnel;

window.deletePersonnel =
  deletePersonnel;
