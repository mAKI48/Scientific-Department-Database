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
  "YOUR_PUBLISHABLE_KEY_HERE";


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
   ERROR
   ================================================== */

function showError(message) {

  const box =
    document.getElementById(
      "error"
    );

  if (!box) return;

  box.classList.remove(
    "hidden"
  );

  box.textContent =
    "DATABASE ERROR: " +
    message;

}


function clearError() {

  const box =
    document.getElementById(
      "error"
    );

  if (!box) return;

  box.classList.add(
    "hidden"
  );

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
      document.getElementById(
        "updated"
      );

    if (updated) {

      updated.textContent =
        " | DATABASE LOADED: " +
        new Date()
          .toLocaleString();

    }

  }

  catch (error) {

    console.error(error);

    showError(
      error.message
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
    document.getElementById(
      "stats"
    );

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
      class="record test-card"
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


      <div class="record-foot">

        Clearance:
        Level
        ${escapeHTML(
          s.clearance
        )}

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

        |

        CLEARANCE
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

        ${escapeHTML(
          value
        )}

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


  overlay
    .classList
    .add("open");


  document.body.style.overflow =
    "hidden";

}


function closeReport() {

  const overlay =
    document.getElementById(
      "report-overlay"
    );

  if (!overlay) return;


  overlay
    .classList
    .remove("open");


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


  box.innerHTML =

    state.personnel.length

      ?

      state.personnel
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
      "Documents remain available through their configured links."
    );

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
    data.session?.user ||
    null;


  updateAdminUI();

}


function isAdmin() {

  return Boolean(

    currentUser &&

    currentUser.id ===
      ADMIN_UID

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


  if (!nav || !login || !dashboard)
    return;


  if (isAdmin()) {

    nav.classList.remove(
      "hidden"
    );

    login.classList.add(
      "hidden"
    );

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

    nav.classList.add(
      "hidden"
    );

    login.classList.remove(
      "hidden"
    );

    dashboard.classList.add(
      "hidden"
    );

  }

}


/* ==================================================
   ADMIN LISTS
   ================================================== */

function renderAdminLists() {

  if (!isAdmin())
    return;


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

            <div
              class="admin-record"
            >

              <div>

                <strong>

                  ${escapeHTML(
                    p.name
                  )}

                </strong>


                <small>

                  ${escapeHTML(
                    p.rank
                  )}

                  |

                  LEVEL
                  ${escapeHTML(
                    p.clearance
                  )}

                </small>

              </div>


              <div
                class="admin-actions"
              >

                <button
                  type="button"
                  onclick="movePersonnel(${index}, -1)"
                  title="Move up"
                  ${index === 0 ? "disabled" : ""}
                >
                  ▲
                </button>


                <button
                  type="button"
                  onclick="movePersonnel(${index}, 1)"
                  title="Move down"
                  ${index === state.personnel.length - 1 ? "disabled" : ""}
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
      .upsert(

        [

          {
            id: current.id,
            sort_order: otherOrder
          },

          {
            id: other.id,
            sort_order: currentOrder
          }

        ],

        {
          onConflict: "id"
        }

      );


  if (error) {

    console.error(error);

    alert(
      "Could not move personnel:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   DELETE PERSONNEL
   ================================================== */

async function deletePersonnel(
  id
) {

  if (!isAdmin())
    return;


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
      .eq("id", id);


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
   ADD PERSONNEL
   ================================================== */

const personnelForm =
  document.getElementById(
    "personnel-admin-form"
  );


if (personnelForm) {

  personnelForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin())
        return;


      const maxOrder =
        state.personnel.reduce(

          (max, p) =>
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
              document
                .getElementById(
                  "admin-personnel-name"
                )
                .value
                .trim(),

            rank:
              document
                .getElementById(
                  "admin-personnel-rank"
                )
                .value
                .trim(),

            clearance:
              document
                .getElementById(
                  "admin-personnel-clearance"
                )
                .value
                .trim(),

            department:
              document
                .getElementById(
                  "admin-personnel-department"
                )
                .value
                .trim(),

            tests_conducted:
              document
                .getElementById(
                  "admin-personnel-tests"
                )
                .value
                .trim(),

            status:
              document
                .getElementById(
                  "admin-personnel-status"
                )
                .value
                .trim(),

            sort_order:
              maxOrder + 1

          });


      if (error) {

        alert(
          "Could not add personnel:\n" +
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

              ${escapeHTML(
                s.number
              )}

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

const scpForm =
  document.getElementById(
    "scp-admin-form"
  );


if (scpForm) {

  scpForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin())
        return;


      const {
        error
      } =
        await supabaseClient
          .from("scps")
          .insert({

            number:
              document
                .getElementById(
                  "admin-scp-number"
                )
                .value,

            name:
              document
                .getElementById(
                  "admin-scp-name"
                )
                .value,

            object_class:
              document
                .getElementById(
                  "admin-scp-class"
                )
                .value,

            risk_class:
              document
                .getElementById(
                  "admin-scp-risk"
                )
                .value,

            containment_zone:
              document
                .getElementById(
                  "admin-scp-zone"
                )
                .value,

            clearance:
              document
                .getElementById(
                  "admin-scp-clearance"
                )
                .value,

            description:
              document
                .getElementById(
                  "admin-scp-description"
                )
                .value

          });


      if (error) {

        alert(
          "Could not add SCP:\n" +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }
  );

}


async function deleteSCP(
  id
) {

  if (!isAdmin())
    return;


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
      .eq("id", id);


  if (error) {

    alert(
      "Could not delete SCP:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   ADMIN TESTS
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

              ${escapeHTML(
                t.test_number
              )}

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

const testForm =
  document.getElementById(
    "test-admin-form"
  );


if (testForm) {

  testForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin())
        return;


      const get =
        id =>
          document
            .getElementById(id)
            .value;


      const {
        error
      } =
        await supabaseClient
          .from("tests")
          .insert({

            test_number:
              get(
                "admin-test-number"
              ),

            date:
              get(
                "admin-test-date"
              ),

            scientist:
              get(
                "admin-test-scientist"
              ),

            clearance:
              get(
                "admin-test-clearance"
              ),

            scp:
              get(
                "admin-test-scp"
              ),

            question:
              get(
                "admin-test-question"
              ),

            hypothesis:
              get(
                "admin-test-hypothesis"
              ),

            log:
              get(
                "admin-test-log"
              ),

            outcome:
              get(
                "admin-test-outcome"
              ),

            results:
              get(
                "admin-test-results"
              ),

            research_notes:
              get(
                "admin-test-research"
              ),

            conclusion:
              get(
                "admin-test-conclusion"
              ),

            scientist_note:
              get(
                "admin-test-note"
              ),

            casualties:
              get(
                "admin-test-casualties"
              ),

            follow_up:
              get(
                "admin-test-followup"
              )

          });


      if (error) {

        alert(
          "Could not add test:\n" +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }
  );

}


async function deleteTest(
  id
) {

  if (!isAdmin())
    return;


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
      .eq("id", id);


  if (error) {

    alert(
      "Could not delete test:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   ADMIN INCIDENTS
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

              ${escapeHTML(
                i.incident_id ||
                i.id
              )}

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

const incidentForm =
  document.getElementById(
    "incident-admin-form"
  );


if (incidentForm) {

  incidentForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!isAdmin())
        return;


      const get =
        id =>
          document
            .getElementById(id)
            .value;


      const {
        error
      } =
        await supabaseClient
          .from("incidents")
          .insert({

            incident_id:
              get(
                "admin-incident-id"
              ),

            title:
              get(
                "admin-incident-title"
              ),

            date:
              get(
                "admin-incident-date"
              ),

            location:
              get(
                "admin-incident-location"
              ),

            scp:
              get(
                "admin-incident-scp"
              ),

            status:
              get(
                "admin-incident-status"
              ),

            summary:
              get(
                "admin-incident-summary"
              ),

            personnel:
              get(
                "admin-incident-personnel"
              ),

            casualties:
              get(
                "admin-incident-casualties"
              ),

            resolution:
              get(
                "admin-incident-resolution"
              )

          });


      if (error) {

        alert(
          "Could not add incident:\n" +
          error.message
        );

        return;

      }


      event.target.reset();

      await loadData();

    }
  );

}


async function deleteIncident(
  id
) {

  if (!isAdmin())
    return;


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
      .eq("id", id);


  if (error) {

    alert(
      "Could not delete incident:\n" +
      error.message
    );

    return;

  }


  await loadData();

}


/* ==================================================
   NAVIGATION
   ================================================== */

function showSection(
  section
) {

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

          showSection(
            button.dataset.section
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
    event =>
      renderSCPs(
        event.target.value
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
    event =>
      renderTests(
        event.target.value
      )
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
      event.key ===
      "Escape"
    ) {

      closeReport();

    }

  }
);


/* ==================================================
   DARK / LIGHT MODE
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


const darkButton =
  document.getElementById(
    "dark-mode-button"
  );


if (darkButton) {

  darkButton.addEventListener(
    "click",
    () =>
      setTheme(
        "dark"
      )
  );

}


const lightButton =
  document.getElementById(
    "light-mode-button"
  );


if (lightButton) {

  lightButton.addEventListener(
    "click",
    () =>
      setTheme(
        "light"
      )
  );

}


/* ==================================================
   LOAD SAVED THEME
   ================================================== */

const savedTheme =
  localStorage.getItem(
    "scd-theme"
  );


setTheme(
  savedTheme === "light"
    ? "light"
    : "dark"
);


/* ==================================================
   AUTH STATE
   ================================================== */

supabaseClient
  .auth
  .onAuthStateChange(
    (_event, session) => {

      currentUser =
        session?.user ||
        null;

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
