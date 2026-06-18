"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  BookOpenCheck,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Gauge,
  Handshake,
  MessageCircleWarning,
  MessageSquare,
  OctagonAlert,
  ShieldAlert,
  TriangleAlert,
  Users,
  Workflow
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BorderGlow from "@/components/ui/BorderGlow";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { DashboardInfoTrigger, dashboardInfoTriggerCornerClassName } from "@/components/ui/DashboardInfoOverlay";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName,
  workspaceGuidePanelClassName,
  workspaceGuidePanelScrollClassName
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { WELLBEING_INFO_ID, wellbeingTools } from "@/lib/wellbeingTools";
import workspaceStyles from "@/components/chat/WorkspacePanel.module.css";
import HardCaseWorkflow from "./HardCaseWorkflow";
import InterruptionsWorkflow from "./InterruptionsWorkflow";
import OverviewWorkflow from "./OverviewWorkflow";
import QuickCheckWorkflow from "./QuickCheckWorkflow";
import RecoveryWorkflow from "./RecoveryWorkflow";
import RoleBoundariesWorkflow from "./RoleBoundariesWorkflow";
import StarterSupportWorkflow from "./StarterSupportWorkflow";
import WorkplaceViolenceWorkflow from "./WorkplaceViolenceWorkflow";
import WorkBoundariesWorkflow from "./WorkBoundariesWorkflow";
import WorkProcessesWorkflow from "./WorkProcessesWorkflow";
import styles from "./WellbeingPage.module.css";

const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";
const WORKSPACE_SUBPAGE_ENTRY_STORAGE_KEY = "__SOTSIAALAI_WORKSPACE_SUBPAGE_ENTRY__";

const iconMap = {
  BadgeCheck,
  BriefcaseBusiness,
  BookOpenCheck,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Gauge,
  Handshake,
  MessageCircleWarning,
  MessageSquare,
  OctagonAlert,
  ShieldAlert,
  TriangleAlert,
  Users,
  Workflow
};

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "wellbeing-page-shell fixed inset-0 isolate z-[30] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-transparent px-[1rem] py-0 max-[768px]:[--mobile-glass-card-gap:clamp(0.32rem,1.35vw,0.4rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-0";

const surfaceClassName =
  `workspace-feature-panel workspace-scroll-surface wellbeing-page-surface mobile-keep-desktop-glass-cards relative z-[21] mx-auto mt-[clamp(1rem,3vh,1.75rem)] mb-[clamp(0.35rem,1.8vh,1rem)] max-h-[calc(100dvh-2rem)] overflow-hidden overscroll-contain rounded-[2rem] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] ` +
  `min-[769px]:[--workspace-subpage-header-margin-bottom:0.35rem] min-[769px]:[--workspace-subpage-title-margin-top:clamp(2.15rem,5.4vh,3.25rem)] min-[769px]:[--workspace-subpage-title-margin-bottom:clamp(0.18rem,0.9vh,0.42rem)] px-[1.1rem] pt-[0.35rem] pb-[1.15rem] max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] max-[768px]:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:!max-w-none max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.82rem] ${glassPageMobileCardClassName} ${workspaceGuidePanelClassName}`;

const bodyClassName =
  `relative ${workspaceGuidePanelScrollClassName} mx-auto flex w-full max-w-[min(56rem,100%)] min-h-0 flex-1 flex-col gap-[0.7rem] px-[0.05rem] pt-0 pb-[0.25rem] max-[768px]:max-w-none max-[768px]:gap-[0.58rem] max-[768px]:px-[0.05rem]`;

const wellbeingToolRows = Object.freeze(
  wellbeingTools.reduce((rows, tool, index) => {
    if (index % 2 === 0) rows.push([tool]);
    else rows[rows.length - 1].push(tool);
    return rows;
  }, [])
);

function markChatWorkspaceRestore() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CHAT_WORKSPACE_RESTORE_STORAGE_KEY,
      JSON.stringify({
        ts: Date.now(),
        workspace: true,
        suppressOpenTransition: true,
        source: "wellbeing"
      })
    );
  } catch {}
}

function consumeWorkspaceSubpageEntry(expectedPath) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem(WORKSPACE_SUBPAGE_ENTRY_STORAGE_KEY);
    if (!raw) return false;
    window.sessionStorage.removeItem(WORKSPACE_SUBPAGE_ENTRY_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const ts = Number(parsed?.ts || 0);
    const fresh = Number.isFinite(ts) && Date.now() - ts < 30 * 60 * 1000;
    return fresh && parsed?.source === "workspace" && parsed?.path === expectedPath;
  } catch {
    try {
      window.sessionStorage.removeItem(WORKSPACE_SUBPAGE_ENTRY_STORAGE_KEY);
    } catch {}
    return false;
  }
}

function ToolIcon({ name }) {
  const Icon = iconMap[name] || ClipboardList;
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.7} />;
}

export default function WellbeingPage({ activeTool = null, locale = "et" }) {
  const router = useRouter();
  const { t } = useI18n();
  const activeTitle = activeTool?.title || t("chat.workspace.wellbeing_page.title", "Tööheaolu");
  const infoId = activeTool?.infoId || WELLBEING_INFO_ID;

  const navigate = useCallback((path) => {
    router.push(localizePath(path, locale));
  }, [locale, router]);

  const handleBack = useCallback(() => {
    if (activeTool) {
      navigate("/tooheaolu");
      return;
    }
    markChatWorkspaceRestore();
    if (consumeWorkspaceSubpageEntry("/tooheaolu")) {
      router.back();
      return;
    }
    navigate("/vestlus?workspace=1");
  }, [activeTool, navigate, router]);

  return (
    <div className={cn(shellClassName, styles.page)}>
      <section
        className={cn(surfaceClassName, styles.surface)}
        role="region"
        aria-labelledby="wellbeing-title"
      >
        <div className={cn(!activeTool && styles.dashboardBody, bodyClassName)}>
          <GlassSubpageHeader
            onBack={handleBack}
            backAriaLabel={t("chat.workspace.wellbeing_page.back_label", "Tagasi")}
            holdPressedVisualDisabled
            anchorBack={false}
            backClassName="workspace-scroll-back-button"
            titleId="wellbeing-title"
            rightSlot={
              <DashboardInfoTrigger
                infoId={infoId}
                title={activeTitle}
                label={
                  activeTool
                    ? t("chat.workspace.wellbeing_page.tool_info_label", "Ava tööriista info")
                    : t("chat.workspace.wellbeing_page.info_label", "Ava Tööheaolu info")
                }
                className={dashboardInfoTriggerCornerClassName}
              />
            }
          >
            {activeTitle}
          </GlassSubpageHeader>

          {activeTool?.id === "quick-check" ? (
            <QuickCheckWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "overview" ? (
            <OverviewWorkflow />
          ) : activeTool?.id === "hard-case" ? (
            <HardCaseWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "workplace-violence" ? (
            <WorkplaceViolenceWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "recovery" ? (
            <RecoveryWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "work-boundaries" ? (
            <WorkBoundariesWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "interruptions" ? (
            <InterruptionsWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "work-processes" ? (
            <WorkProcessesWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "role-boundaries" ? (
            <RoleBoundariesWorkflow onNavigate={navigate} />
          ) : activeTool?.id === "starter-support" ? (
            <StarterSupportWorkflow onNavigate={navigate} />
          ) : activeTool ? (
            <div className={styles.placeholderWrap}>
              <BorderGlow
                as="section"
                className={styles.placeholderPanel}
                edgeSensitivity={24}
                glowColor="358 82 72"
                backgroundColor="var(--wellbeing-card-bg, #120F17)"
                borderRadius={16}
                glowRadius={42}
                glowIntensity={0.62}
                coneSpread={20}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                fillOpacity={0}
                edgeOnly
              >
                <span className={styles.placeholderIcon} aria-hidden="true">
                  <ToolIcon name={activeTool.icon} />
                </span>
                <h2>{activeTool.title}</h2>
                <p>{activeTool.description}</p>
                <p className={styles.placeholderText}>
                  {t("chat.workspace.wellbeing_page.placeholder", "Töövoog lisandub järgmises etapis.")}
                </p>
                <Button
                  type="button"
                  variant="linkBrand"
                  onClick={() => navigate("/tooheaolu")}
                  className={styles.secondaryButton}
                >
                  {t("chat.workspace.wellbeing_page.back_to_workspace", "Tagasi Tööheaolu tööruumi")}
                </Button>
              </BorderGlow>
            </div>
          ) : (
            <div
              className={cn(styles.toolsGrid, workspaceStyles.grid)}
              aria-label={t("chat.workspace.wellbeing_page.tools_label", "Tööheaolu tööriistad")}
            >
              {wellbeingToolRows.map((row, index) => (
                <div
                  key={`wellbeing-row-${index + 1}`}
                  className={cn(workspaceStyles.row, row.length === 1 && workspaceStyles.rowSingle)}
                >
                  {row.map((tool) => (
                    <BorderGlow
                      key={tool.id}
                      as="button"
                      type="button"
                      className={cn("workspace-dashboard-card", workspaceStyles.card)}
                      onClick={() => navigate(tool.route)}
                      edgeSensitivity={30}
                      glowColor="358 82 72"
                      backgroundColor="#120F17"
                      borderRadius={13}
                      glowRadius={42}
                      glowIntensity={0.72}
                      coneSpread={20}
                      colors={["#c084fc", "#f472b6", "#38bdf8"]}
                      fillOpacity={0}
                      edgeOnly
                      aria-label={`${tool.title}. ${tool.description}`}
                    >
                      <span className={workspaceStyles.cardIcon} aria-hidden="true">
                        <ToolIcon name={tool.icon} />
                      </span>
                      <span className={workspaceStyles.cardCopy}>
                        <span className={workspaceStyles.cardTitle}>{tool.title}</span>
                      </span>
                    </BorderGlow>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
