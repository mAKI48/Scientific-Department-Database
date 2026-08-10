/* ==================================================
   SCD SCIENTIFIC DATABASE
   SUPABASE + ADMIN PANEL
   ================================================== */


/* ==================================================
   SUPABASE CONFIG
   ================================================== */

const SUPABASE_URL =
  "https://hytqegmmwlvnyeraytec.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PjiITaK5ILnagliukxereA_9fhwO-jO";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* ==================================================
   ADMIN
   ================================================== */

const ADMIN_UID =
  "1da022eb-e2cc-47a7-bf2a-a1762c638467";

let currentUser = null;


/* ==================================================
   DATABASE STATE
   ================================================== */

let state = {
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

  return String(value ?? "")

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
   ERROR HANDLING
   ================================================== */

function showError(message) {

  const box =
    document.getElementById("error");

  if (!box) return;

  box.classList.remove("hidden");

  box.textContent =
    "DATABASE ERROR: " + message;

}


function clearError() {

  const box =
    document.getElementById("error");

  if (!box) return;

  box.classList.add("hidden");

  box.textContent = "";

}


/* ==================================================
   LOAD DATABASE
   ================================================== */

async function loadData() {

  clearError();

  try {

    const [
      scps,
      tests,
      incidents,
      personnel
    ] = await Promise.all([

      supabaseClient
        .from("scps")
        .select("*"),

      supabaseClient
        .from("tests")
        .select("*")
        .order(
          "id",
          {
            ascending: true
          }
        ),

      supabaseClient
        .from("incidents")
        .select("*")
        .order(
          "id",
          {
            ascending: true
          }
        ),

      supabaseClient
        .from("personnel")
        .select("*")
        .order(
          "sort_order",
          {
            ascending: true,
            nullsFirst: false
          }
        )

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

    renderAdminLists();


    const updated =
      document.getElementById("updated");

    if (updated) {

      updated.textContent =
        " | DATABASE LOADED: " +
        new Date().toLocaleString();

    }

  }

  catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Unknown database error."
    );

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

  const box =
    document.getElementById("stats");

  if (!box) return;


  box.innerHTML = `

    <div class="stat">

      <strong>
        ${state.scps.length}
      </strong>

      <span>
        SCP FILES
      </span>

    </div>


    <div class="stat">

      <strong>
        ${state.tests.length}
      </strong>

      <span>
        TEST REPORTS
      </span>

    </div>


    <div class="stat">

      <strong>
        ${state.incidents.length}
      </strong>

      <span>
        INCIDENTS
      </span>

    </div>


    <div class="stat">

      <strong>
        ${state.personnel.length}
      </strong>

      <span>
        PERSONNEL
      </span>

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

  if (!box) return;


  const tests =
    [...state.tests]
      .slice(-3)
      .reverse();


  box.innerHTML =
    tests.length

      ? tests
          .map(testCompact)
          .join("")

      : empty(
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
        ${escapeHTML(
          t.test_number
        )}
      </b>


      <span>

        ${escapeHTML(
          t.scp
        )}

        —

        ${escapeHTML(
          t.scientist
        )}

      </span>


      <small>

        ${escapeHTML(
          t.date
        )}

        |

        ${escapeHTML(
          t.outcome
        )}

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

  if (!box) return;


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

      `
        .toLowerCase()
        .includes(q)
    );


  box.innerHTML =
    records.length

      ? records
          .map(scpCard)
          .join("")

      : empty(
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

          ${escapeHTML(
            s.number
          )}

          —

          ${escapeHTML(
            s.name
          )}

        </h3>


        <span class="tag">

          ${escapeHTML(
            s.object_class
          )}

        </span>

      </div>


      <div class="meta">

        Risk:
        ${escapeHTML(
          s.risk_class
        )}

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

  if (!s) return;


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
              s.number
            )}

            —

            ${escapeHTML(
              s.name
            )}

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
            Risk:
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


      ${reportSection(
        "CONTAINMENT ZONE",
        s.containment_zone
      )}


      ${reportSection(
        "DESCRIPTION",
        s.description
      )}


      <div class="report-footer">

        FOUNDATION INTERNAL ARCHIVE

        <br>

        CLEARANCE LEVEL
        ${escapeHTML(
          s.clearance
        )}

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

  if (!box) return;


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

      ? records
          .map(
            t =>
              testCard(
                t,
                state.tests.indexOf(t)
              )
          )
          .join("")

      : empty(
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
   OPEN TEST REPORT
   ================================================== */

function openTest(index) {

  const t =
    state.tests[index];

  if (!t) return;


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

          <strong>
            Date:
          </strong>

          ${escapeHTML(
            t.date
          )}

        </span>


        <span>

          <strong>
            Scientist:
          </strong>

          ${escapeHTML(
            t.scientist
          )}

        </span>


        <span>

          <strong>
            Clearance:
          </strong>

          ${escapeHTML(
            t.clearance
          )}

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
        t.log
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
  value
) {

  return `

    <div class="report-section">

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${escapeHTML(value)}
      </p>

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

  if (!box) return;


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

  if (!i) return;


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

  if (!overlay) return;

  overlay.classList.add("open");

  document.body.style.overflow =
    "hidden";

}


function closeReport() {

  const overlay =
    document.getElementById(
      "report-overlay"
    );

  if (!overlay) return;

  overlay.classList.remove("open");

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

  if (!box) return;


  const list =
    [...state.personnel];


  box.innerHTML =

    list.length

      ?

      list
        .map(
          p => `

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
   DOCUMENTS
   ================================================== */

function renderDocuments() {

  const box =
    document.getElementById(
      "document-list"
    );

  if (!box) return;


  box.innerHTML =
    empty(
      "Documents remain available through their Google Doc links."
    );

}


/* ==================================================
   EMPTY
   ================================================== */

function empty(message) {

  return `

    <div class="empty">

      ${escapeHTML(
        message
      )}

    </div>

  `;

}


/* ==================================================
   ADMIN AUTH
   ================================================== */

async function checkAdminSession() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();


  if (error) {

    console.error(error);

    return;

  }


  currentUser =
    data.session?.user || null;


  updateAdminUI();

}


function isAdmin() {

  return Boolean(
    currentUser &&
    currentUser.id === ADMIN_UID
  );

}


/* ==================================================
   ADMIN UI
   ================================================== */

function updateAdminUI() {

  const nav =
    document.getElementById(
      "admin-nav-button"
    );

  const login =
    document.getElementById(
      "admin-login"
    );

  const dashboard =
    document.getElementById(
      "admin-dashboard"
    );


  if (
    isAdmin()
  ) {

    if (nav)
      nav.classList.remove(
        "hidden"
      );

    if (login)
      login.classList.add(
        "hidden"
      );

    if (dashboard)
      dashboard.classList.remove(
        "hidden"
      );


    const email =
      document.getElementById(
        "admin-email"
      );

    if (email) {

      email.textContent =
        currentUser.email || "";

    }


    renderAdminLists();

  }

  else {

    if (nav)
      nav.classList.add(
        "hidden"
      );

    if (login)
      login.classList.remove(
        "hidden"
      );

    if (dashboard)
      dashboard.classList.add(
        "hidden"
      );

  }

}


/* ==================================================
   LOGIN
   ================================================== */

const loginForm =
  document.getElementById(
    "login-form"
  );


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        document.getElementById(
          "login-email"
        ).value.trim();


      const password =
        document.getElementById(
          "login-password"
        ).value;


      const errorBox =
        document.getElementById(
          "login-error"
        );


      if (errorBox) {

        errorBox.classList.add(
          "hidden"
        );

      }


      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .signInWithPassword({
            email,
            password
          });


      if (error) {

        if (errorBox) {

          errorBox.textContent =
            error.message;

          errorBox.classList.remove(
            "hidden"
          );

        }

        return;

      }


      currentUser =
        data.user;


      if (!isAdmin()) {

        await supabaseClient
          .auth
          .signOut();


        currentUser = null;


        if (errorBox) {

          errorBox.textContent =
            "ACCESS DENIED: This account is not authorized as an administrator.";

          errorBox.classList.remove(
            "hidden"
          );

        }

        return;

      }


      updateAdminUI();

      showSection("admin");

    }

  );

}


/* ==================================================
   LOGOUT
   ================================================== */

const logoutButton =
  document.getElementById(
    "logout-button"
  );


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      await supabaseClient
        .auth
        .signOut();


      currentUser = null;

      updateAdminUI();

      showSection("home");

    }
  );

}


/* ==================================================
   ADMIN LISTS
   ================================================== */

function renderAdminLists() {

  if (!isAdmin()) return;

  renderAdminPersonnel();

  renderAdminSCPs();

  renderAdminTests();

  renderAdminIncidents();

}


/* ==================================================
   ADMIN PERSONNEL
   ================================================== */

function renderAdminPersonnel() {

  const box =
    document.getElementById(
      "admin-personnel-list"
    );

  if (!box) return;


  box.innerHTML =

    state.personnel.length

      ?

      state.personnel
        .map(
          (p, index) => `

            <div class="admin-record">

              <div>

                <strong>

                  ${escapeHTML(
                    p.name
                  )}

                </strong>

                <br>

                <small>

                  ${escapeHTML(
                    p.rank
                  )}

                  |

                  Level
                  ${escapeHTML(
                    p.clearance
                  )}

                </small>

              </div>


              <div class="admin-actions">

                <button
                  type="button"
                  onclick="movePersonnel(${index}, -1)"
                  ${index === 0 ? "disabled" : ""}
                >
                  ▲
                </button>


                <button
                  type="button"
                  onclick="movePersonnel(${index}, 1)"
                  ${
                    index ===
                    state.personnel.length - 1
                      ? "disabled"
                      : ""
                  }
                >
                  ▼
                </button>


                <button
                  type="button"
                  onclick="deletePersonnel('${escapeHTML(p.id)}')"
                >
                  DELETE
                </button>

              </div>

            </div>

          `
        )
        .join("")

      :

      empty(
        "No personnel records found."
      );

}


/* ==================================================
   MOVE PERSONNEL UP / DOWN
   ================================================== */

async function movePersonnel(
  index,
  direction
) {

  if (!isAdmin()) {

    alert(
      "ACCESS DENIED"
    );

    return;

  }


  const list =
    [...state.personnel];


  const target =
    index + direction;


  if (
    index < 0 ||
    target < 0 ||
    target >= list.length
  ) {

    return;

  }


  const current =
    list[index];


  const other =
    list[target];


  const currentOrder =
    Number(
      current.sort_order ?? index
    );


  const otherOrder =
    Number(
      other.sort_order ?? target
    );


  const {
    error
  } =
    await supabaseClient
      .from("personnel")
      .update({
        sort_order:
          otherOrder
      })
      .eq(
        "id",
        current.id
      );


  if (error) {

    alert(
      "Could not move personnel: " +
      error.message
    );

    console.error(error);

    return;

  }


  const {
    error: secondError
  } =
    await supabaseClient
      .from("personnel")
      .update({
        sort_order:
          currentOrder
      })
      .eq(
        "id",
        other.id
      );


  if (secondError) {

    alert(
      "Could not finish personnel move: " +
      secondError.message
    );

    console.error(
      secondError
    );

    return;

  }


  await loadData();

}


/* ==================================================
   DELETE PERSONNEL
   ================================================== */

async function deletePersonnel(id) {

  if (!isAdmin()) return;


  if (
    !confirm(
      "Delete this personnel record?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("personnel")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "Could not delete personnel: " +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   ADD PERSONNEL
   ================================================== */

const personnelAdminForm =
  document.getElementById(
    "personnel-admin-form"
  );


if (personnelAdminForm) {

  personnelAdminForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin()) return;


      const maxOrder =
        state.personnel.reduce(
          (
            max,
            p
          ) =>
            Math.max(
              max,
              Number(
                p.sort_order ?? -1
              )
            ),
          -1
        );


      const {
        error
      } =
        await supabaseClient
          .from("personnel")
          .insert({

            name:
              document.getElementById(
                "admin-personnel-name"
              ).value.trim(),

            rank:
              document.getElementById(
                "admin-personnel-rank"
              ).value.trim(),

            clearance:
              document.getElementById(
                "admin-personnel-clearance"
              ).value.trim(),

            department:
              document.getElementById(
                "admin-personnel-department"
              ).value.trim(),

            tests_conducted:
              document.getElementById(
                "admin-personnel-tests"
              ).value.trim(),

            status:
              document.getElementById(
                "admin-personnel-status"
              ).value.trim(),

            sort_order:
              maxOrder + 1

          });


      if (error) {

        alert(
          "Could not add personnel: " +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }

  );

}


/* ==================================================
   ADMIN SCP LIST
   ================================================== */

function renderAdminSCPs() {

  const box =
    document.getElementById(
      "admin-scp-list"
    );

  if (!box) return;


  box.innerHTML =
    state.scps
      .map(
        s => `

          <div class="admin-record">

            <span>

              <strong>
                ${escapeHTML(
                  s.number
                )}
              </strong>

              —

              ${escapeHTML(
                s.name
              )}

            </span>


            <button
              type="button"
              onclick="deleteSCP('${escapeHTML(s.id)}')"
            >
              DELETE
            </button>

          </div>

        `
      )
      .join("");

}


/* ==================================================
   ADD SCP
   ================================================== */

const scpAdminForm =
  document.getElementById(
    "scp-admin-form"
  );


if (scpAdminForm) {

  scpAdminForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin()) return;


      const {
        error
      } =
        await supabaseClient
          .from("scps")
          .insert({

            number:
              document.getElementById(
                "admin-scp-number"
              ).value.trim(),

            name:
              document.getElementById(
                "admin-scp-name"
              ).value.trim(),

            object_class:
              document.getElementById(
                "admin-scp-class"
              ).value.trim(),

            risk_class:
              document.getElementById(
                "admin-scp-risk"
              ).value.trim(),

            containment_zone:
              document.getElementById(
                "admin-scp-zone"
              ).value.trim(),

            clearance:
              document.getElementById(
                "admin-scp-clearance"
              ).value.trim(),

            description:
              document.getElementById(
                "admin-scp-description"
              ).value.trim()

          });


      if (error) {

        alert(
          "Could not add SCP: " +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }

  );

}


/* ==================================================
   DELETE SCP
   ================================================== */

async function deleteSCP(id) {

  if (!isAdmin()) return;


  if (
    !confirm(
      "Delete this SCP file?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("scps")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "Could not delete SCP: " +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   ADMIN TEST LIST
   ================================================== */

function renderAdminTests() {

  const box =
    document.getElementById(
      "admin-test-list"
    );

  if (!box) return;


  box.innerHTML =
    state.tests
      .map(
        t => `

          <div class="admin-record">

            <span>

              <strong>
                ${escapeHTML(
                  t.test_number
                )}
              </strong>

              —

              ${escapeHTML(
                t.scp
              )}

              —

              ${escapeHTML(
                t.scientist
              )}

            </span>


            <button
              type="button"
              onclick="deleteTest('${escapeHTML(t.id)}')"
            >
              DELETE
            </button>

          </div>

        `
      )
      .join("");

}


/* ==================================================
   ADD TEST
   ================================================== */

const testAdminForm =
  document.getElementById(
    "test-admin-form"
  );


if (testAdminForm) {

  testAdminForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin()) return;


      const {
        error
      } =
        await supabaseClient
          .from("tests")
          .insert({

            test_number:
              document.getElementById(
                "admin-test-number"
              ).value.trim(),

            date:
              document.getElementById(
                "admin-test-date"
              ).value,

            scientist:
              document.getElementById(
                "admin-test-scientist"
              ).value.trim(),

            clearance:
              document.getElementById(
                "admin-test-clearance"
              ).value.trim(),

            scp:
              document.getElementById(
                "admin-test-scp"
              ).value.trim(),

            question:
              document.getElementById(
                "admin-test-question"
              ).value.trim(),

            hypothesis:
              document.getElementById(
                "admin-test-hypothesis"
              ).value.trim(),

            log:
              document.getElementById(
                "admin-test-log"
              ).value.trim(),

            outcome:
              document.getElementById(
                "admin-test-outcome"
              ).value.trim(),

            results:
              document.getElementById(
                "admin-test-results"
              ).value.trim(),

            research_notes:
              document.getElementById(
                "admin-test-research"
              ).value.trim(),

            conclusion:
              document.getElementById(
                "admin-test-conclusion"
              ).value.trim(),

            scientist_note:
              document.getElementById(
                "admin-test-note"
              ).value.trim(),

            casualties:
              document.getElementById(
                "admin-test-casualties"
              ).value.trim(),

            follow_up:
              document.getElementById(
                "admin-test-followup"
              ).value.trim()

          });


      if (error) {

        alert(
          "Could not add test: " +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }

  );

}


/* ==================================================
   DELETE TEST
   ================================================== */

async function deleteTest(id) {

  if (!isAdmin()) return;


  if (
    !confirm(
      "Delete this test report?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("tests")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "Could not delete test: " +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   ADMIN INCIDENT LIST
   ================================================== */

function renderAdminIncidents() {

  const box =
    document.getElementById(
      "admin-incident-list"
    );

  if (!box) return;


  box.innerHTML =
    state.incidents
      .map(
        i => `

          <div class="admin-record">

            <span>

              <strong>

                ${escapeHTML(
                  i.incident_id ||
                  i.id
                )}

              </strong>

              —

              ${escapeHTML(
                i.title
              )}

            </span>


            <button
              type="button"
              onclick="deleteIncident('${escapeHTML(i.id)}')"
            >
              DELETE
            </button>

          </div>

        `
      )
      .join("");

}


/* ==================================================
   ADD INCIDENT
   ================================================== */

const incidentAdminForm =
  document.getElementById(
    "incident-admin-form"
  );


if (incidentAdminForm) {

  incidentAdminForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin()) return;


      const {
        error
      } =
        await supabaseClient
          .from("incidents")
          .insert({

            incident_id:
              document.getElementById(
                "admin-incident-id"
              ).value.trim(),

            title:
              document.getElementById(
                "admin-incident-title"
              ).value.trim(),

            date:
              document.getElementById(
                "admin-incident-date"
              ).value,

            location:
              document.getElementById(
                "admin-incident-location"
              ).value.trim(),

            scp:
              document.getElementById(
                "admin-incident-scp"
              ).value.trim(),

            status:
              document.getElementById(
                "admin-incident-status"
              ).value.trim(),

            summary:
              document.getElementById(
                "admin-incident-summary"
              ).value.trim(),

            personnel:
              document.getElementById(
                "admin-incident-personnel"
              ).value.trim(),

            casualties:
              document.getElementById(
                "admin-incident-casualties"
              ).value.trim(),

            resolution:
              document.getElementById(
                "admin-incident-resolution"
              ).value.trim()

          });


      if (error) {

        alert(
          "Could not add incident: " +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }

  );

}


/* ==================================================
   DELETE INCIDENT
   ================================================== */

async function deleteIncident(id) {

  if (!isAdmin()) return;


  if (
    !confirm(
      "Delete this incident?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("incidents")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(
      "Could not delete incident: " +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   NAVIGATION
   ================================================== */

function showSection(section) {

  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.section ===
          section
        );

      }
    );


  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      page => {

        page.classList.toggle(
          "active",
          page.id === section
        );

      }
    );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


document
  .querySelectorAll(
    ".nav-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const section =
            button.dataset.section;


          if (
            section === "admin" &&
            !isAdmin()
          ) {

            showSection("admin");

            return;

          }


          showSection(
            section
          );

        }
      );

    }
  );


/* ==================================================
   SEARCH
   ================================================== */

const scpSearch =
  document.getElementById(
    "scp-search"
  );


if (scpSearch) {

  scpSearch.addEventListener(
    "input",
    event => {

      renderSCPs(
        event.target.value
      );

    }
  );

}


const testSearch =
  document.getElementById(
    "test-search"
  );


if (testSearch) {

  testSearch.addEventListener(
    "input",
    event => {

      renderTests(
        event.target.value
      );

    }
  );

}


/* ==================================================
   REPORT CLOSE
   ================================================== */

const reportClose =
  document.getElementById(
    "report-close"
  );


if (reportClose) {

  reportClose.addEventListener(
    "click",
    closeReport
  );

}


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeReport();

    }

  }
);


/* ==================================================
   DARK / LIGHT MODE
   ================================================== */

function setTheme(theme) {

  if (
    theme === "light"
  ) {

    document.body
      .classList
      .add("light-mode");


    localStorage.setItem(
      "scd-theme",
      "light"
    );

  }

  else {

    document.body
      .classList
      .remove("light-mode");


    localStorage.setItem(
      "scd-theme",
      "dark"
    );

  }

}


const darkButton =
  document.getElementById(
    "dark-mode-button"
  );


if (darkButton) {

  darkButton.addEventListener(
    "click",
    () => setTheme("dark")
  );

}


const lightButton =
  document.getElementById(
    "light-mode-button"
  );


if (lightButton) {

  lightButton.addEventListener(
    "click",
    () => setTheme("light")
  );

}


/* ==================================================
   LOAD SAVED THEME
   ================================================== */

const savedTheme =
  localStorage.getItem(
    "scd-theme"
  );


if (
  savedTheme === "light"
) {

  setTheme("light");

}

else {

  setTheme("dark");

}


/* ==================================================
   AUTH STATE
   ================================================== */

supabaseClient
  .auth
  .onAuthStateChange(
    (_event, session) => {

      currentUser =
        session?.user || null;

      updateAdminUI();

    }
  );


/* ==================================================
   START
   ================================================== */

(async function start() {

  await checkAdminSession();

  await loadData();

})();
