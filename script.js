/* ==================================================
   SCD SCIENTIFIC DATABASE
   SUPABASE + ADMIN PANEL
================================================== */

/* ==================================================
   SUPABASE CONFIG
================================================== */

const SUPABASE_URL = "https://hytqegmmwlvnyeraytec.supabase.co";
const SUPABASE_KEY = "sb_publishable_PjiITaK5ILnagliukxereA_9fhwO-jO";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==================================================
   ADMIN
================================================== */

const ADMIN_UID = "1da022eb-e2cc-47a7-bf2a-a1762c638467";

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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==================================================
   ERROR HANDLING
================================================== */

function showError(message) {
    const box = document.getElementById("error");

    if (!box) {
        console.error("DATABASE ERROR:", message);
        return;
    }

    box.classList.remove("hidden");
    box.textContent = "DATABASE ERROR: " + message;
}

function clearError() {
    const box = document.getElementById("error");

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
                .order("id", {
                    ascending: true
                }),

            supabaseClient
                .from("incidents")
                .select("*")
                .order("id", {
                    ascending: true
                }),

            supabaseClient
                .from("personnel")
                .select("*")
                .order("sort_order", {
                    ascending: true,
                    nullsFirst: false
                })
        ]);

        if (scps.error) throw scps.error;
        if (tests.error) throw tests.error;
        if (incidents.error) throw incidents.error;
        if (personnel.error) throw personnel.error;

        state.scps = scps.data || [];
        state.tests = tests.data || [];
        state.incidents = incidents.data || [];
        state.personnel = personnel.data || [];

        renderAll();
        renderAdminLists();

        const updated = document.getElementById("updated");

        if (updated) {
            updated.textContent =
                " | DATABASE LOADED: " +
                new Date().toLocaleString();
        }

    } catch (error) {

        console.error(error);
        showError(error.message);
    }
}


/* ==================================================
   RENDER EVERYTHING
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
    const box = document.getElementById("stats");

    if (!box) return;

    box.innerHTML = `
        ${state.scps.length} SCP FILES
        ${state.tests.length} TEST REPORTS
        ${state.incidents.length} INCIDENTS
        ${state.personnel.length} PERSONNEL
    `;
}


/* ==================================================
   RECENT TESTS
================================================== */

function renderRecent() {
    const box = document.getElementById("recent-tests");

    if (!box) return;

    const tests = [...state.tests]
        .slice(-3)
        .reverse();

    box.innerHTML = tests.length
        ? tests.map(testCompact).join("")
        : empty("No test reports filed.");
}

function testCompact(t) {
    return `
        <div class="compact-test">
            <strong>${escapeHTML(t.test_number)}</strong>
            ${escapeHTML(t.scp)}
            —
            ${escapeHTML(t.scientist)}
            ${escapeHTML(t.date)}
            |
            ${escapeHTML(t.outcome)}
        </div>
    `;
}


/* ==================================================
   SCP FILES
================================================== */

function renderSCPs(filter = "") {

    const q = filter.toLowerCase();

    const records = state.scps.filter(s =>
        `${s.number}
        ${s.name}
        ${s.object_class}
        ${s.risk_class}
        ${s.containment_zone}`
            .toLowerCase()
            .includes(q)
    );

    const box = document.getElementById("scp-list");

    if (!box) return;

    box.innerHTML = records.length
        ? records.map(scpCard).join("")
        : empty("No SCP files found.");
}


function scpCard(s) {

    const index = state.scps.indexOf(s);

    return `
        <div class="scp-card" onclick="openSCP(${index})">

            <h3>
                ${escapeHTML(s.number)}
                —
                ${escapeHTML(s.name)}
            </h3>

            <div>
                ${escapeHTML(s.object_class)}
            </div>

            <div>
                Risk:
                ${escapeHTML(s.risk_class)}
                |
                Zone:
                ${escapeHTML(s.containment_zone)}
            </div>

            <p>
                ${escapeHTML(s.description)}
            </p>

            <strong>
                CLICK TO VIEW FULL SCP FILE
            </strong>

        </div>
    `;
}


/* ==================================================
   OPEN SCP
================================================== */

function openSCP(index) {

    const s = state.scps[index];

    if (!s) return;

    const box = document.getElementById("report-content");

    if (!box) return;

    box.innerHTML = `
        <div class="report-header">
            SCIENTIFIC DEPARTMENT
        </div>

        <h2>
            ${escapeHTML(s.number)}
            —
            ${escapeHTML(s.name)}
        </h2>

        <p>
            ${escapeHTML(s.object_class)}
        </p>

        <p>
            Object Class:
            ${escapeHTML(s.object_class)}
            <br>

            Risk:
            ${escapeHTML(s.risk_class)}
            <br>

            Clearance:
            Level ${escapeHTML(s.clearance)}
        </p>

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
            CLEARANCE
            ${escapeHTML(s.clearance)}
        </div>
    `;

    openReport();
}


/* ==================================================
   TEST REPORTS
================================================== */

function renderTests(filter = "") {

    const q = filter.toLowerCase();

    const records = state.tests.filter(t =>
        `
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

    const box = document.getElementById("test-list");

    if (!box) return;

    box.innerHTML = records.length
        ? records
            .map(t =>
                testCard(
                    t,
                    state.tests.indexOf(t)
                )
            )
            .join("")
        : empty("No test reports found.");
}


function testCard(t, index) {

    return `
        <div class="test-card"
             onclick="openTest(${index})">

            <h3>
                ${escapeHTML(t.test_number)}
                —
                ${escapeHTML(t.scp)}
            </h3>

            <strong>
                ${escapeHTML(t.outcome)}
            </strong>

            <div>
                ${escapeHTML(t.date)}
                |
                Scientist:
                ${escapeHTML(t.scientist)}
                |
                Clearance:
                ${escapeHTML(t.clearance)}
            </div>

            <p>
                Question:
                ${escapeHTML(t.question)}
            </p>

            <strong>
                CLICK TO VIEW FULL TEST REPORT
            </strong>

        </div>
    `;
}


/* ==================================================
   OPEN TEST
================================================== */

function openTest(index) {

    const t = state.tests[index];

    if (!t) return;

    const box = document.getElementById("report-content");

    if (!box) return;

    box.innerHTML = `

        <div class="report-header">
            SCIENTIFIC DEPARTMENT
        </div>

        <h2>
            ${escapeHTML(t.test_number)}
            —
            ${escapeHTML(t.scp)}
        </h2>

        <p>
            <strong>
                ${escapeHTML(t.outcome)}
            </strong>
        </p>

        <p>
            Date:
            ${escapeHTML(t.date)}
            <br>

            Scientist:
            ${escapeHTML(t.scientist)}
            <br>

            Clearance:
            ${escapeHTML(t.clearance)}
        </p>

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

        ${reportSection(
            "CASUALTIES",
            t.casualties ||
            "None recorded"
        )}

        ${reportSection(
            "FOLLOW-UP",
            t.follow_up ||
            "None recorded"
        )}
    `;

    openReport();
}


/* ==================================================
   REPORT SECTION
================================================== */

function reportSection(title, value) {

    return `
        <section class="report-section">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(value)}
            </p>

        </section>
    `;
}


/* ==================================================
   INCIDENTS
================================================== */

function renderIncidents() {

    const box =
        document.getElementById("incident-list");

    if (!box) return;

    box.innerHTML = state.incidents.length

        ? [...state.incidents]
            .reverse()
            .map(incident => {

                const index =
                    state.incidents.indexOf(incident);

                return `
                    <div class="incident-card"
                         onclick="openIncident(${index})">

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

                        <strong>
                            ${escapeHTML(
                                incident.status
                            )}
                        </strong>

                        <div>
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
                            Summary:
                            ${escapeHTML(
                                incident.summary
                            )}
                        </p>

                        <strong>
                            CLICK TO VIEW FULL INCIDENT REPORT
                        </strong>

                    </div>
                `;
            })
            .join("")

        : empty("No incident reports found.");
}


/* ==================================================
   OPEN INCIDENT
================================================== */

function openIncident(index) {

    const i = state.incidents[index];

    if (!i) return;

    const box =
        document.getElementById("report-content");

    if (!box) return;

    box.innerHTML = `

        <div class="report-header">
            SCIENTIFIC DEPARTMENT
        </div>

        <h2>
            ${escapeHTML(
                i.incident_id || i.id
            )}
            —
            ${escapeHTML(i.title)}
        </h2>

        <p>
            <strong>
                ${escapeHTML(i.status)}
            </strong>
        </p>

        <p>
            Date:
            ${escapeHTML(i.date)}
            <br>

            Location:
            ${escapeHTML(i.location)}
            <br>

            SCP:
            ${escapeHTML(i.scp)}
        </p>

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
   REPORT OVERLAY
================================================== */

function openReport() {

    const overlay =
        document.getElementById("report-overlay");

    if (!overlay) return;

    overlay.classList.add("open");

    document.body.style.overflow = "hidden";
}


function closeReport() {

    const overlay =
        document.getElementById("report-overlay");

    if (!overlay) return;

    overlay.classList.remove("open");

    document.body.style.overflow = "";
}


/* ==================================================
   PERSONNEL
================================================== */

function renderPersonnel() {

    const box =
        document.getElementById("personnel-list");

    if (!box) return;

    const list = [...state.personnel];

    box.innerHTML = list.length

        ? list.map(p => `

            <div class="personnel-card">

                <h3>
                    ${escapeHTML(p.name)}
                </h3>

                <strong>
                    LEVEL
                    ${escapeHTML(p.clearance)}
                </strong>

                <div>
                    ${escapeHTML(p.rank)}
                    |
                    ${escapeHTML(p.department)}
                </div>

                <div>
                    Tests conducted:
                    ${escapeHTML(
                        p.tests_conducted
                    )}
                </div>

                <div>
                    Status:
                    ${escapeHTML(p.status)}
                </div>

            </div>

        `).join("")

        : empty("No personnel records found.");
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

    box.innerHTML = empty(
        "Documents remain available through their Google Doc links."
    );
}


/* ==================================================
   EMPTY
================================================== */

function empty(message) {

    return `
        <div class="empty">
            ${escapeHTML(message)}
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
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        return;
    }

    currentUser =
        data.session?.user || null;

    updateAdminUI();
}


function isAdmin() {

    return (
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

    if (!nav || !login || !dashboard) {
        return;
    }

    if (isAdmin()) {

        nav.classList.remove("hidden");

        login.classList.add("hidden");

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

    } else {

        nav.classList.add("hidden");

        login.classList.remove(
            "hidden"
        );

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
                await supabaseClient.auth
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

            currentUser = data.user;

            if (!isAdmin()) {

                await supabaseClient.auth
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

            await supabaseClient.auth
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

    box.innerHTML = state.personnel.length

        ? state.personnel
            .map((p, index) => `

                <div class="admin-list-item">

                    <span>
                        ${escapeHTML(p.name)}
                        —
                        ${escapeHTML(p.rank)}
                        |
                        Level
                        ${escapeHTML(
                            p.clearance
                        )}
                    </span>

                    <button
                        onclick="movePersonnel(${index}, -1)"
                    >
                        ▲
                    </button>

                    <button
                        onclick="movePersonnel(${index}, 1)"
                    >
                        ▼
                    </button>

                    <button
                        onclick="deletePersonnel('${p.id}')"
                    >
                        DELETE
                    </button>

                </div>

            `)
            .join("")

        : empty(
            "No personnel records found."
        );
}


/* ==================================================
   MOVE PERSONNEL
================================================== */

async function movePersonnel(
    index,
    direction
) {

    if (!isAdmin()) {
        alert("ACCESS DENIED");
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
        current.sort_order ?? index;

    const otherOrder =
        other.sort_order ?? target;

    const { error } =
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

        alert(
            "Could not move personnel: " +
            error.message
        );

        console.error(error);

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

    const { error } =
        await supabaseClient
            .from("personnel")
            .delete()
            .eq("id", id);

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

const personnelForm =
    document.getElementById(
        "personnel-admin-form"
    );

if (personnelForm) {

    personnelForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!isAdmin()) return;

            const maxOrder =
                state.personnel.reduce(
                    (max, p) =>
                        Math.max(
                            max,
                            Number(
                                p.sort_order ?? 0
                            )
                        ),
                    -1
                );

            const { error } =
                await supabaseClient
                    .from("personnel")
                    .insert({

                        name:
                            document.getElementById(
                                "admin-personnel-name"
                            ).value,

                        rank:
                            document.getElementById(
                                "admin-personnel-rank"
                            ).value,

                        clearance:
                            document.getElementById(
                                "admin-personnel-clearance"
                            ).value,

                        department:
                            document.getElementById(
                                "admin-personnel-department"
                            ).value,

                        tests_conducted:
                            document.getElementById(
                                "admin-personnel-tests"
                            ).value,

                        status:
                            document.getElementById(
                                "admin-personnel-status"
                            ).value,

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
            .map(s => `

                <div class="admin-list-item">

                    <span>
                        ${escapeHTML(s.number)}
                        —
                        ${escapeHTML(s.name)}
                    </span>

                    <button
                        onclick="deleteSCP('${s.id}')"
                    >
                        DELETE
                    </button>

                </div>

            `)
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

            if (!isAdmin()) return;

            const { error } =
                await supabaseClient
                    .from("scps")
                    .insert({

                        number:
                            document.getElementById(
                                "admin-scp-number"
                            ).value,

                        name:
                            document.getElementById(
                                "admin-scp-name"
                            ).value,

                        object_class:
                            document.getElementById(
                                "admin-scp-class"
                            ).value,

                        risk_class:
                            document.getElementById(
                                "admin-scp-risk"
                            ).value,

                        containment_zone:
                            document.getElementById(
                                "admin-scp-zone"
                            ).value,

                        clearance:
                            document.getElementById(
                                "admin-scp-clearance"
                            ).value,

                        description:
                            document.getElementById(
                                "admin-scp-description"
                            ).value
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

    const { error } =
        await supabaseClient
            .from("scps")
            .delete()
            .eq("id", id);

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
            .map(t => `

                <div class="admin-list-item">

                    <span>
                        ${escapeHTML(
                            t.test_number
                        )}

                        —
                        ${escapeHTML(t.scp)}

                        —
                        ${escapeHTML(
                            t.scientist
                        )}
                    </span>

                    <button
                        onclick="deleteTest('${t.id}')"
                    >
                        DELETE
                    </button>

                </div>

            `)
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

            if (!isAdmin()) return;

            const { error } =
                await supabaseClient
                    .from("tests")
                    .insert({

                        test_number:
                            document.getElementById(
                                "admin-test-number"
                            ).value,

                        date:
                            document.getElementById(
                                "admin-test-date"
                            ).value,

                        scientist:
                            document.getElementById(
                                "admin-test-scientist"
                            ).value,

                        clearance:
                            document.getElementById(
                                "admin-test-clearance"
                            ).value,

                        scp:
                            document.getElementById(
                                "admin-test-scp"
                            ).value,

                        question:
                            document.getElementById(
                                "admin-test-question"
                            ).value,

                        hypothesis:
                            document.getElementById(
                                "admin-test-hypothesis"
                            ).value,

                        log:
                            document.getElementById(
                                "admin-test-log"
                            ).value,

                        outcome:
                            document.getElementById(
                                "admin-test-outcome"
                            ).value,

                        results:
                            document.getElementById(
                                "admin-test-results"
                            ).value,

                        research_notes:
                            document.getElementById(
                                "admin-test-research"
                            ).value,

                        conclusion:
                            document.getElementById(
                                "admin-test-conclusion"
                            ).value,

                        scientist_note:
                            document.getElementById(
                                "admin-test-note"
                            ).value,

                        casualties:
                            document.getElementById(
                                "admin-test-casualties"
                            ).value,

                        follow_up:
                            document.getElementById(
                                "admin-test-followup"
                            ).value
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

    const { error } =
        await supabaseClient
            .from("tests")
            .delete()
            .eq("id", id);

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
            .map(i => `

                <div class="admin-list-item">

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
                        onclick="deleteIncident('${i.id}')"
                    >
                        DELETE
                    </button>

                </div>

            `)
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

            if (!isAdmin()) return;

            const { error } =
                await supabaseClient
                    .from("incidents")
                    .insert({

                        incident_id:
                            document.getElementById(
                                "admin-incident-id"
                            ).value,

                        title:
                            document.getElementById(
                                "admin-incident-title"
                            ).value,

                        date:
                            document.getElementById(
                                "admin-incident-date"
                            ).value,

                        location:
                            document.getElementById(
                                "admin-incident-location"
                            ).value,

                        scp:
                            document.getElementById(
                                "admin-incident-scp"
                            ).value,

                        status:
                            document.getElementById(
                                "admin-incident-status"
                            ).value,

                        summary:
                            document.getElementById(
                                "admin-incident-summary"
                            ).value,

                        personnel:
                            document.getElementById(
                                "admin-incident-personnel"
                            ).value,

                        casualties:
                            document.getElementById(
                                "admin-incident-casualties"
                            ).value,

                        resolution:
                            document.getElementById(
                                "admin-incident-resolution"
                            ).value
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

    const { error } =
        await supabaseClient
            .from("incidents")
            .delete()
            .eq("id", id);

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
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                section
            );
        });

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.toggle(
                "active",
                page.id === section
            );
        });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.dataset.section ===
                    "admin" &&
                    !isAdmin()
                ) {

                    showSection("admin");

                    return;
                }

                showSection(
                    button.dataset.section
                );
            }
        );
    });


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

        if (event.key === "Escape") {
            closeReport();
        }
    }
);


/* ==================================================
   AUTH STATE
================================================== */

supabaseClient.auth.onAuthStateChange(
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
