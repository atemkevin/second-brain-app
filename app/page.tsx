"use client";

import {
  Archive,
  AreaChart,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  FileText,
  FolderKanban,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Link2,
  ListChecks,
  Menu,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  NotebookPen,
  PanelLeftClose,
  PenTool,
  Plus,
  Search,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type CodeStage = "Capture" | "Organize" | "Distill" | "Express";
type CaptureType = "link" | "note" | "image" | "voice";

type Project = {
  id: number;
  title: string;
  area: string;
  due: string;
  progress: number;
  stage: CodeStage;
  color: "teal" | "blue" | "amber" | "violet";
};

type FocusTask = {
  id: number;
  title: string;
  done: boolean;
};

type InboxItem = {
  id: number | string;
  title: string;
  type: CaptureType;
  created: string;
};

type ReviewStep = {
  id: number;
  title: string;
  done: boolean;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Inbox", icon: Inbox },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Areas", icon: Target },
  { label: "Resources", icon: BookOpen },
  { label: "Archives", icon: Archive },
];

const utilityItems = [
  { label: "Create", icon: Plus },
  { label: "Reviews", icon: CalendarDays },
];

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Launch Personal Knowledge App",
    area: "Product",
    due: "Jul 28, 2026",
    progress: 68,
    stage: "Distill",
    color: "teal",
  },
  {
    id: 2,
    title: "Build a Weekly Review Habit",
    area: "Personal Growth",
    due: "Jul 31, 2026",
    progress: 45,
    stage: "Organize",
    color: "blue",
  },
  {
    id: 3,
    title: "Prepare Second Brain Workshop",
    area: "Learning",
    due: "Aug 6, 2026",
    progress: 32,
    stage: "Capture",
    color: "amber",
  },
  {
    id: 4,
    title: "Publish Productivity Field Guide",
    area: "Writing",
    due: "Aug 14, 2026",
    progress: 18,
    stage: "Express",
    color: "violet",
  },
];

const initialFocusTasks: FocusTask[] = [
  { id: 1, title: "Finalize the dashboard information hierarchy", done: false },
  { id: 2, title: "Distill research notes into key takeaways", done: true },
  { id: 3, title: "Draft the first version of the product brief", done: false },
];

const initialInboxItems: InboxItem[] = [
  { id: 1, title: "Article: designing for calm technology", type: "link", created: "8:42 AM" },
  { id: 2, title: "Idea for the weekly review flow", type: "note", created: "Yesterday" },
  { id: 3, title: "Dashboard reference layout", type: "image", created: "Yesterday" },
  { id: 4, title: "Voice note about project momentum", type: "voice", created: "Jul 15" },
  { id: 5, title: "Useful onboarding checklist", type: "link", created: "Jul 14" },
  { id: 6, title: "Notes from product planning", type: "note", created: "Jul 14" },
  { id: 7, title: "Mobile navigation reference", type: "image", created: "Jul 13" },
];

const initialReviewSteps: ReviewStep[] = [
  { id: 1, title: "Clear the capture inbox", done: true },
  { id: 2, title: "Review active projects", done: true },
  { id: 3, title: "Choose this week’s priorities", done: true },
  { id: 4, title: "Archive completed work", done: false },
  { id: 5, title: "Write a Continue From Here note", done: false },
];

const captureIcons = {
  link: Link2,
  note: FileText,
  image: ImageIcon,
  voice: Mic2,
};

const captureLabels = {
  link: "Link",
  note: "Note",
  image: "Image",
  voice: "Voice",
};

const stageDescriptions: Record<CodeStage, string> = {
  Capture: "Save ideas and information",
  Organize: "Place it where it becomes useful",
  Distill: "Find and clarify the essence",
  Express: "Create and share your work",
};

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      // Restore the client-only demo state after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setValue(JSON.parse(saved) as T);
    } catch {
      // A blocked storage API should not prevent the dashboard from working.
    }
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the in-memory experience working if persistence is unavailable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default function HomePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureType, setCaptureType] = useState<CaptureType>("note");
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [focusTasks, setFocusTasks] = usePersistentState<FocusTask[]>(
    "second-brain-focus",
    initialFocusTasks,
  );
  const [inboxItems, setInboxItems] = usePersistentState<InboxItem[]>(
    "second-brain-inbox",
    initialInboxItems,
  );
  const [reviewSteps, setReviewSteps] = usePersistentState<ReviewStep[]>(
    "second-brain-review",
    initialReviewSteps,
  );

  const reviewPercent = Math.round(
    (reviewSteps.filter((step) => step.done).length / reviewSteps.length) * 100,
  );

  const captureCounts = useMemo(
    () =>
      (["link", "note", "image", "voice"] as CaptureType[]).map((type) => ({
        type,
        count: inboxItems.filter((item) => item.type === type).length,
      })),
    [inboxItems],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    void fetch("/api/supabase-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((config: { url?: string; anonKey?: string } | null) => {
        if (!active || !config?.url || !config.anonKey) return;
        setSupabase(getSupabaseBrowserClient({ url: config.url, anonKey: config.anonKey }));
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setCloudUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setCloudUser(session?.user ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !cloudUser) return;

    let active = true;
    void supabase
      .from("items")
      .select("id,title,item_type,created_at")
      .eq("para_category", "inbox")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setInboxItems(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.item_type as CaptureType,
            created: new Date(item.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
          })),
        );
      });

    return () => {
      active = false;
    };
  }, [cloudUser, setInboxItems, supabase]);

  function toggleFocusTask(id: number) {
    setFocusTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function toggleReviewStep(id: number) {
    setReviewSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, done: !step.done } : step)),
    );
  }

  async function submitCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = captureTitle.trim();
    if (!title) return;

    if (supabase && cloudUser) {
      const { data, error } = await supabase
        .from("items")
        .insert({
          user_id: cloudUser.id,
          title,
          item_type: captureType,
          para_category: "inbox",
          code_stage: "capture",
        })
        .select("id,title,item_type,created_at")
        .single();

      if (!error && data) {
        setInboxItems((current) => [
          {
            id: data.id,
            title: data.title,
            type: data.item_type as CaptureType,
            created: "Just now",
          },
          ...current,
        ]);
        setCaptureTitle("");
        setCaptureType("note");
        setCaptureOpen(false);
        setToast("Captured and synced to Supabase");
        return;
      }

      setToast("Cloud table is not ready yet — saved on this device");
    }

    setInboxItems((current) => [
      { id: `local-${Date.now()}`, title, type: captureType, created: "Just now" },
      ...current,
    ]);
    setCaptureTitle("");
    setCaptureType("note");
    setCaptureOpen(false);
    setToast("Captured safely in your Inbox");
  }

  async function processInboxItem(id: number | string) {
    if (supabase && cloudUser && typeof id === "string" && !id.startsWith("local-")) {
      await supabase.from("items").delete().eq("id", id);
    }
    setInboxItems((current) => current.filter((item) => item.id !== id));
    setToast("Item moved to Projects");
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authEmail.trim()) return;

    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthLoading(false);

    if (error) {
      setToast(error.message);
      return;
    }

    setAuthOpen(false);
    setToast("Check your email for the secure sign-in link");
  }

  async function handleCloudAccount() {
    if (cloudUser && supabase) {
      await supabase.auth.signOut();
      setToast("Cloud sync signed out");
      return;
    }
    setAuthOpen(true);
  }

  function selectNavigation(label: string) {
    setActiveNav(label);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <button
        className={`mobile-scrim ${sidebarOpen ? "visible" : ""}`}
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <BrainCircuit size={27} strokeWidth={1.9} />
          </div>
          <span>SECOND BRAIN</span>
          <button
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose size={21} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => selectNavigation(label)}
            >
              <Icon size={21} strokeWidth={1.9} />
              <span>{label}</span>
              {label === "Inbox" && inboxItems.length > 0 ? (
                <span className="nav-count">{inboxItems.length}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="nav-divider" />

        <nav className="utility-nav" aria-label="Creation and reviews">
          {utilityItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => selectNavigation(label)}
            >
              <Icon size={21} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="sidebar-footer" onClick={handleCloudAccount}>
          <div className="avatar">{cloudUser?.email?.slice(0, 1).toUpperCase() ?? "K"}</div>
          <div>
            <strong>{cloudUser ? "Supabase connected" : "Connect cloud sync"}</strong>
            <span>{cloudUser?.email ?? (supabase ? "Sign in with email" : "Setup required")}</span>
          </div>
        </button>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <button aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="mobile-brand">
            <BrainCircuit size={22} />
            <span>SECOND BRAIN</span>
          </div>
          <button aria-label="Quick capture" onClick={() => setCaptureOpen(true)}>
            <Plus size={24} />
          </button>
        </header>

        {activeNav === "Dashboard" ? (
          <Dashboard
            captureCounts={captureCounts}
            focusTasks={focusTasks}
            inboxItems={inboxItems}
            projects={initialProjects}
            reviewPercent={reviewPercent}
            onCapture={() => setCaptureOpen(true)}
            onReview={() => setReviewOpen(true)}
            onToggleFocus={toggleFocusTask}
            onNavigate={selectNavigation}
          />
        ) : (
          <WorkspaceView
            section={activeNav}
            inboxItems={inboxItems}
            projects={initialProjects}
            reviewSteps={reviewSteps}
            onCapture={() => setCaptureOpen(true)}
            onProcess={processInboxItem}
            onReview={() => setReviewOpen(true)}
          />
        )}
      </main>

      {captureOpen ? (
        <Modal title="Quick Capture" onClose={() => setCaptureOpen(false)}>
          <form className="capture-form" onSubmit={submitCapture}>
            <p className="modal-intro">
              Capture it now. Decide where it belongs during your review.
            </p>
            <div className="capture-types" role="radiogroup" aria-label="Capture type">
              {(["note", "link", "image", "voice"] as CaptureType[]).map((type) => {
                const Icon = captureIcons[type];
                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={captureType === type}
                    className={captureType === type ? "selected" : ""}
                    onClick={() => setCaptureType(type)}
                  >
                    <Icon size={19} />
                    {captureLabels[type]}
                  </button>
                );
              })}
            </div>
            <label className="field-label" htmlFor="capture-title">
              What do you want to remember?
            </label>
            <textarea
              id="capture-title"
              autoFocus
              value={captureTitle}
              onChange={(event) => setCaptureTitle(event.target.value)}
              placeholder="Write an idea, paste a link, or leave a note to your future self…"
              rows={5}
            />
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setCaptureOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={!captureTitle.trim()}>
                <Send size={17} />
                Save to Inbox
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {reviewOpen ? (
        <Modal title="Weekly Review" onClose={() => setReviewOpen(false)}>
          <div className="review-modal-content">
            <div className="review-progress-line">
              <div>
                <span>{reviewPercent}% complete</span>
                <strong>Reset your system for the week ahead</strong>
              </div>
              <ReviewRing percent={reviewPercent} compact />
            </div>
            <div className="review-checklist">
              {reviewSteps.map((step) => (
                <button key={step.id} onClick={() => toggleReviewStep(step.id)}>
                  {step.done ? (
                    <CheckCircle2 className="checked" size={22} />
                  ) : (
                    <Circle size={22} />
                  )}
                  <span className={step.done ? "done" : ""}>{step.title}</span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setReviewOpen(false)}>
                Continue later
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setReviewOpen(false);
                  setToast(reviewPercent === 100 ? "Weekly review complete" : "Review progress saved");
                }}
              >
                <Check size={17} />
                Save review
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {authOpen ? (
        <Modal title="Connect Supabase" onClose={() => setAuthOpen(false)}>
          <form className="capture-form" onSubmit={sendMagicLink}>
            <p className="modal-intro">
              Sign in with a secure email link to sync your Inbox across devices.
            </p>
            <label className="field-label" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              autoFocus
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="privacy-note">No password needed. Supabase sends a one-time sign-in link.</p>
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setAuthOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={authLoading || !authEmail.trim()}>
                <Send size={17} />
                {authLoading ? "Sending…" : "Send sign-in link"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Dashboard({
  captureCounts,
  focusTasks,
  inboxItems,
  projects,
  reviewPercent,
  onCapture,
  onReview,
  onToggleFocus,
  onNavigate,
}: {
  captureCounts: { type: CaptureType; count: number }[];
  focusTasks: FocusTask[];
  inboxItems: InboxItem[];
  projects: Project[];
  reviewPercent: number;
  onCapture: () => void;
  onReview: () => void;
  onToggleFocus: (id: number) => void;
  onNavigate: (label: string) => void;
}) {
  return (
    <div className="dashboard-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Friday, July 17</p>
          <h1>Good morning</h1>
          <p className="page-subtitle">Capture quickly. Organize lightly. Create continuously.</p>
        </div>
        <div className="heading-actions">
          <button className="icon-button search-button" aria-label="Search your Second Brain">
            <Search size={19} />
          </button>
          <button className="button primary quick-capture" onClick={onCapture}>
            <Plus size={19} />
            Quick Capture
          </button>
        </div>
      </div>

      <section className="metric-grid" aria-label="Workspace overview">
        <MetricCard icon={FolderKanban} value="12" label="Active Projects" tone="teal" />
        <MetricCard icon={Inbox} value={String(inboxItems.length)} label="Inbox Items" tone="blue" />
        <MetricCard icon={CalendarDays} value="3" label="Due This Week" tone="amber" />
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="card focus-card">
            <div className="card-heading">
              <div>
                <p className="section-kicker">MAKE PROGRESS</p>
                <h2>Today’s Focus</h2>
              </div>
              <span className="small-status">
                {focusTasks.filter((task) => task.done).length}/{focusTasks.length} complete
              </span>
            </div>
            <div className="focus-list">
              {focusTasks.map((task) => (
                <button key={task.id} onClick={() => onToggleFocus(task.id)}>
                  <span className={`task-check ${task.done ? "complete" : ""}`}>
                    {task.done ? <Check size={15} /> : null}
                  </span>
                  <span className={task.done ? "task-done" : ""}>{task.title}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card projects-card">
            <div className="card-heading">
              <div>
                <p className="section-kicker">CURRENT COMMITMENTS</p>
                <h2>Active Projects</h2>
              </div>
              <button className="text-button" onClick={() => onNavigate("Projects")}>
                View all <ArrowRight size={15} />
              </button>
            </div>
            <div className="project-table" role="table" aria-label="Active projects">
              <div className="project-row project-header" role="row">
                <span>Project</span>
                <span>Area</span>
                <span>Deadline</span>
                <span>Progress</span>
                <span>CODE stage</span>
                <span />
              </div>
              {projects.map((project) => (
                <div className="project-row" role="row" key={project.id}>
                  <div className="project-name-cell">
                    <span className={`project-icon ${project.color}`}>
                      <FileText size={17} />
                    </span>
                    <strong>{project.title}</strong>
                  </div>
                  <span className="muted-cell">{project.area}</span>
                  <span className="muted-cell">{project.due}</span>
                  <div className="progress-cell">
                    <span>{project.progress}%</span>
                    <div className="progress-track">
                      <span style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <span className={`stage-badge stage-${project.stage.toLowerCase()}`}>
                    {project.stage}
                  </span>
                  <button className="row-menu" aria-label={`More options for ${project.title}`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card continue-card">
            <div className="continue-icon">
              <NotebookPen size={22} />
            </div>
            <div className="continue-copy">
              <p className="section-kicker">HEMINGWAY BRIDGE</p>
              <h2>Continue From Here</h2>
              <strong>Launch Personal Knowledge App — Research Notes</strong>
              <span>Last edited today at 9:18 AM</span>
              <p>Key dashboard sections are mapped. The next pass should focus on the capture flow.</p>
            </div>
            <div className="next-step">
              <span>Next step</span>
              <strong>Draft the product brief using highlighted insights</strong>
            </div>
            <button className="continue-action" aria-label="Continue project">
              <ChevronRight size={22} />
            </button>
          </section>
        </div>

        <aside className="dashboard-rail">
          <section className="card code-card">
            <div className="card-heading compact">
              <div>
                <p className="section-kicker">KNOWLEDGE LIFECYCLE</p>
                <h2>CODE Flow</h2>
              </div>
            </div>
            <div className="code-flow">
              {(["Capture", "Organize", "Distill", "Express"] as CodeStage[]).map((stage, index) => {
                const icons = [Inbox, FolderKanban, Sparkles, PenTool];
                const Icon = icons[index];
                return (
                  <div className={`code-step code-${stage.toLowerCase()}`} key={stage}>
                    <div className="code-marker">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{stage}</strong>
                      <span>{stageDescriptions[stage]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card review-card">
            <div className="card-heading compact">
              <div>
                <p className="section-kicker">SYSTEM MAINTENANCE</p>
                <h2>Weekly Review</h2>
              </div>
              <Clock3 size={19} />
            </div>
            <ReviewRing percent={reviewPercent} />
            <p>Stay clear, current, and ready for what matters next.</p>
            <button className="button primary full-width" onClick={onReview}>
              <ListChecks size={17} />
              Start Review
            </button>
          </section>

          <section className="card inbox-preview-card">
            <div className="card-heading compact">
              <div>
                <p className="section-kicker">UNPROCESSED</p>
                <h2>Inbox Preview</h2>
              </div>
              <button className="text-button" onClick={() => onNavigate("Inbox")}>
                Open
              </button>
            </div>
            <div className="capture-count-grid">
              {captureCounts.map(({ type, count }) => {
                const Icon = captureIcons[type];
                return (
                  <div key={type}>
                    <span className={`capture-count-icon capture-${type}`}>
                      <Icon size={19} />
                    </span>
                    <strong>{count}</strong>
                    <span>{captureLabels[type]}{count === 1 ? "" : "s"}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof FolderKanban;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}>
        <Icon size={25} strokeWidth={1.8} />
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}

function ReviewRing({ percent, compact = false }: { percent: number; compact?: boolean }) {
  return (
    <div
      className={`review-ring ${compact ? "compact" : ""}`}
      style={{ "--review-percent": `${percent * 3.6}deg` } as React.CSSProperties}
      aria-label={`${percent}% complete`}
    >
      <div>
        <strong>{percent}%</strong>
        <span>Complete</span>
      </div>
    </div>
  );
}

function WorkspaceView({
  section,
  inboxItems,
  projects,
  reviewSteps,
  onCapture,
  onProcess,
  onReview,
}: {
  section: string;
  inboxItems: InboxItem[];
  projects: Project[];
  reviewSteps: ReviewStep[];
  onCapture: () => void;
  onProcess: (id: number | string) => void;
  onReview: () => void;
}) {
  const sectionCopy: Record<string, { eyebrow: string; description: string; icon: typeof Inbox }> = {
    Inbox: {
      eyebrow: "CAPTURE",
      description: "A temporary landing place. Process these when you have context, not when inspiration strikes.",
      icon: Inbox,
    },
    Projects: {
      eyebrow: "ACTIVE OUTCOMES",
      description: "Short-term commitments with a finish line, deadline, and clear desired outcome.",
      icon: FolderKanban,
    },
    Areas: {
      eyebrow: "ONGOING STANDARDS",
      description: "The responsibilities and roles you want to maintain over time.",
      icon: Target,
    },
    Resources: {
      eyebrow: "FUTURE REFERENCE",
      description: "Useful topics, curiosities, and materials that may support something later.",
      icon: BookOpen,
    },
    Archives: {
      eyebrow: "COLD STORAGE",
      description: "Completed and inactive material, kept safely outside your daily attention.",
      icon: Archive,
    },
    Create: {
      eyebrow: "EXPRESS",
      description: "Turn distilled knowledge into a useful, concrete output without starting from zero.",
      icon: PenTool,
    },
    Reviews: {
      eyebrow: "REFLECT AND RESET",
      description: "Keep your system aligned with the reality of your commitments and priorities.",
      icon: ClipboardCheck,
    },
  };

  const current = sectionCopy[section] ?? sectionCopy.Projects;
  const HeaderIcon = current.icon;

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{current.eyebrow}</p>
          <h1>{section}</h1>
          <p>{current.description}</p>
        </div>
        <button className="button primary" onClick={section === "Reviews" ? onReview : onCapture}>
          {section === "Reviews" ? <ListChecks size={18} /> : <Plus size={18} />}
          {section === "Reviews" ? "Start Review" : "Add New"}
        </button>
      </div>

      <div className="workspace-banner">
        <span>
          <HeaderIcon size={24} />
        </span>
        <div>
          <strong>{section === "Inbox" ? `${inboxItems.length} items are waiting` : `Your ${section.toLowerCase()} workspace`}</strong>
          <p>Move quickly, touch lightly, and keep information flowing toward action.</p>
        </div>
      </div>

      {section === "Inbox" ? (
        <div className="workspace-list card">
          {inboxItems.length ? (
            inboxItems.map((item) => {
              const Icon = captureIcons[item.type];
              return (
                <article key={item.id}>
                  <span className={`capture-count-icon capture-${item.type}`}>
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{captureLabels[item.type]} · {item.created}</span>
                  </div>
                  <button className="button small secondary" onClick={() => onProcess(item.id)}>
                    Process <ChevronRight size={15} />
                  </button>
                </article>
              );
            })
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={34} />
              <h2>Inbox zero</h2>
              <p>Everything has a useful home for now.</p>
            </div>
          )}
        </div>
      ) : null}

      {section === "Projects" ? (
        <div className="project-card-grid">
          {projects.map((project) => (
            <article className="card project-tile" key={project.id}>
              <div className="tile-topline">
                <span className={`project-icon ${project.color}`}>
                  <FileText size={18} />
                </span>
                <span className={`stage-badge stage-${project.stage.toLowerCase()}`}>{project.stage}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.area} · Due {project.due}</p>
              <div className="tile-progress-copy">
                <span>Progress</span>
                <strong>{project.progress}%</strong>
              </div>
              <div className="progress-track large">
                <span style={{ width: `${project.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {section === "Areas" ? (
        <SimpleCardGrid
          items={[
            ["Health", "Maintain energy, sleep, and regular movement", Target],
            ["Finances", "Keep obligations visible and decisions intentional", AreaChart],
            ["Home", "Maintain a calm, useful living environment", Home],
            ["Personal Growth", "Keep learning connected to lived experience", Lightbulb],
          ]}
        />
      ) : null}

      {section === "Resources" ? (
        <SimpleCardGrid
          items={[
            ["Product Design", "18 notes", PanelLeftClose],
            ["Personal Knowledge", "31 notes", BrainCircuit],
            ["Writing", "14 notes", NotebookPen],
            ["Workshop Methods", "9 notes", MessageSquareText],
          ]}
        />
      ) : null}

      {section === "Archives" ? (
        <div className="workspace-list card">
          {[
            "Portfolio redesign — completed June 2026",
            "Quarterly planning system — completed March 2026",
            "Reading workflow experiment — paused January 2026",
          ].map((title) => (
            <article key={title}>
              <span className="archive-icon"><Archive size={18} /></span>
              <div><strong>{title}</strong><span>Searchable and ready to reuse</span></div>
              <button className="button small secondary">Restore</button>
            </article>
          ))}
        </div>
      ) : null}

      {section === "Create" ? (
        <SimpleCardGrid
          items={[
            ["Product Brief", "Assemble a clear product direction", FileText],
            ["Project Outline", "Create an Archipelago of Ideas", ListChecks],
            ["Presentation", "Build a narrative from distilled notes", PenTool],
            ["Decision Memo", "Turn evidence into a confident decision", ClipboardCheck],
          ]}
          actionLabel="Start creating"
        />
      ) : null}

      {section === "Reviews" ? (
        <div className="workspace-list card review-workspace-list">
          {reviewSteps.map((step) => (
            <article key={step.id}>
              <span className={step.done ? "review-check-done" : "review-check-open"}>
                {step.done ? <Check size={17} /> : <Circle size={17} />}
              </span>
              <div><strong>{step.title}</strong><span>{step.done ? "Complete" : "Waiting for review"}</span></div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SimpleCardGrid({
  items,
  actionLabel,
}: {
  items: [string, string, typeof Target][];
  actionLabel?: string;
}) {
  return (
    <div className="simple-card-grid">
      {items.map(([title, description, Icon]) => (
        <article className="card simple-tile" key={title}>
          <span><Icon size={21} /></span>
          <h2>{title}</h2>
          <p>{description}</p>
          <button className="text-button">
            {actionLabel ?? "Open workspace"} <ArrowRight size={15} />
          </button>
        </article>
      ))}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="section-kicker">SECOND BRAIN</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button aria-label="Close dialog" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
