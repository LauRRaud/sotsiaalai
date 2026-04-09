"use client";

import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";

import RagAdminAlert from "./RagAdminAlert";
import {
  articlesActionsClassName,
  articlesClassName,
  articlesFormClassName,
  articlesHeadClassName,
  articlesListClassName,
  articlesNoteClassName,
  articlesResultClassName,
  articlesTitleClassName,
  buttonBaseClassName,
  buttonCompactClassName,
  buttonGhostClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cardActionsClassName,
  cardBodyClassName,
  cardClassName,
  cardHeadClassName,
  cardSubClassName,
  codeBlockClassName,
  compactDropdownClassName,
  filePickerClassName,
  filePickerNameClassName,
  formNoteClassName,
  ingestMainGridClassName,
  inputClassName,
  labelClassName,
  metaActionsClassName,
  metaCheckBaseClassName,
  metaCheckErrorClassName,
  metaCheckOkClassName,
  metaCheckWarnClassName,
  metaPanelClassName,
  metaPanelGridClassName,
  metaPanelHeadClassName,
  metaPanelLabelClassName,
  metaPanelLinkClassName,
  metaPanelListClassName,
  metaPanelNoteClassName,
  metaPanelTitleClassName,
  metaTabActiveClassName,
  metaTabClassName,
  metaTabsClassName,
  panelStackClassName
} from "./ragAdminShared";

export default function RagAdminIngestView({ controller, showMessage = true }) {
  const {
    tr,
    message,
    resetMessage,
    selftestBusy,
    selftestSteps,
    handleSelftest,
    fetchDocuments,
    loadingList,
    handleUrlSubmit,
    urlFormRef,
    urlTitle,
    setUrlTitle,
    urlDescription,
    setUrlDescription,
    urlTags,
    setUrlTags,
    urlAudience,
    setUrlAudience,
    audienceSelectOptions,
    urlBusy,
    handlePdfMetaSubmit,
    pdfFormRef,
    pdfFileInputRef,
    pdfMetaFileInputRef,
    pdfFileName,
    setPdfFileName,
    pdfMetaFileName,
    setPdfMetaFileName,
    pdfMetaAudience,
    setPdfMetaAudience,
    showMetaGuide,
    setShowMetaGuide,
    handleMetaCheck,
    pdfMetaBusy,
    metaCheck,
    pdfMetaResult,
    articlesDocId,
    setArticlesDocId,
    articlesFileInputRef,
    articlesJsonFileName,
    setArticlesJsonFileName,
    articlesJson,
    setArticlesJson,
    articlesBusy,
    handleArticlesSubmit,
    articlesFormRef,
    articlesResult,
    activeMetaTemplate,
    metaTemplates,
    activeMetaTemplateKey,
    setActiveMetaTemplateKey,
    activeMetaTemplateContent
  } = controller;

  return (
    <div className="grid gap-1.5">
      {showMessage ? <RagAdminAlert message={message} onDismiss={resetMessage} /> : null}

      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className={cardHeadClassName}>
            <div>
              <CardTitle>{tr("admin.rag.ingest.title")}</CardTitle>
              <div className={cardSubClassName}>{tr("admin.rag.ingest.subtitle")}</div>
            </div>
            <div className={cardActionsClassName}>
              <Button
                size="sm"
                variant="primary"
                className={`${buttonBaseClassName} ${buttonSecondaryClassName} ${buttonCompactClassName}`}
                onClick={handleSelftest}
                disabled={selftestBusy}
              >
                {selftestBusy ? tr("admin.rag.selftest.running") : tr("admin.rag.selftest.run")}
              </Button>
              <Button
                size="sm"
                variant="primary"
                className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                onClick={fetchDocuments}
                disabled={loadingList}
              >
                {loadingList ? tr("admin.common.loading") : tr("admin.common.refresh")}
              </Button>
            </div>
          </div>

          <div className={ingestMainGridClassName}>
            <form className={panelStackClassName} onSubmit={handleUrlSubmit} ref={urlFormRef}>
                  <label className={labelClassName}>{tr("admin.rag.ingest.url_section_title")}</label>
                  <Input name="url" placeholder="https://" size="sm" className={inputClassName} />
                  <Input
                    value={urlTitle}
                    onChange={event => setUrlTitle(event.target.value)}
                    placeholder={tr("admin.rag.ingest.url_title_placeholder")}
                    size="sm"
                    className={inputClassName}
                  />
                  <Textarea
                    value={urlDescription}
                    onChange={event => setUrlDescription(event.target.value)}
                    placeholder={tr("admin.rag.ingest.url_description_placeholder")}
                    rows={2}
                    size="sm"
                    className={inputClassName}
                  />
                  <Input
                    value={urlTags}
                    onChange={event => setUrlTags(event.target.value)}
                    placeholder={tr("admin.rag.ingest.url_tags_placeholder")}
                    size="sm"
                    className={inputClassName}
                  />
                  <DocumentsDropdown
                    ariaLabel={tr("admin.rag.ingest.url_section_title")}
                    value={urlAudience}
                    onChange={setUrlAudience}
                    options={audienceSelectOptions}
                    className={compactDropdownClassName}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    variant="primary"
                    className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName} self-start`}
                    disabled={urlBusy}
                  >
                    {urlBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.ingest.send_url")}
                  </Button>
            </form>

            <form className={panelStackClassName} onSubmit={handlePdfMetaSubmit} ref={pdfFormRef}>
                  <label className={labelClassName}>{tr("admin.rag.ingest.pdf_section_title")}</label>
                  <div className={formNoteClassName}>{tr("admin.rag.ingest.pdf_section_note")}</div>
                  <input
                    ref={pdfFileInputRef}
                    name="pdfWithMetaFile"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={event => setPdfFileName(event.target.files?.[0]?.name || "")}
                  />
                  <div className={filePickerClassName}>
                    <Button
                      type="button"
                      size="sm"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      onClick={() => pdfFileInputRef.current?.click()}
                    >
                      Vali fail
                    </Button>
                    <span className={filePickerNameClassName}>{pdfFileName || "Pole valitud PDF faili"}</span>
                  </div>
                  <input
                    ref={pdfMetaFileInputRef}
                    name="pdfMetaFile"
                    type="file"
                    accept="application/json"
                    className="sr-only"
                    onChange={event => setPdfMetaFileName(event.target.files?.[0]?.name || "")}
                  />
                  <div className={filePickerClassName}>
                    <Button
                      type="button"
                      size="sm"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      onClick={() => pdfMetaFileInputRef.current?.click()}
                    >
                      Vali fail
                    </Button>
                    <span className={filePickerNameClassName}>{pdfMetaFileName || "Pole valitud JSON faili"}</span>
                  </div>
                  <Textarea
                    name="pdfMetaText"
                    placeholder={tr("admin.rag.ingest.pdf_meta_text_placeholder")}
                    rows={3}
                    size="sm"
                    className={inputClassName}
                  />
                  <DocumentsDropdown
                    ariaLabel={tr("admin.rag.ingest.pdf_section_title")}
                    value={pdfMetaAudience}
                    onChange={setPdfMetaAudience}
                    options={audienceSelectOptions}
                    className={compactDropdownClassName}
                  />
                  <div className={metaActionsClassName}>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                      onClick={() => setShowMetaGuide(state => !state)}
                      aria-expanded={showMetaGuide}
                      aria-controls="rag-meta-panel"
                    >
                      {showMetaGuide ? tr("admin.rag.meta.hide_templates") : tr("admin.rag.meta.open_templates")}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className={`${buttonBaseClassName} ${buttonGhostClassName} ${buttonCompactClassName}`}
                      onClick={handleMetaCheck}
                    >
                      {tr("admin.rag.meta.check_json")}
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      disabled={pdfMetaBusy}
                    >
                      {pdfMetaBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.ingest.send_pdf_with_meta")}
                    </Button>
                  </div>
                  {metaCheck ? (
                    <div
                      className={`${metaCheckBaseClassName} ${
                        metaCheck.type === "ok"
                          ? metaCheckOkClassName
                          : metaCheck.type === "warn"
                            ? metaCheckWarnClassName
                            : metaCheckErrorClassName
                      }`}
                    >
                      {metaCheck.text}
                    </div>
                  ) : null}
                  {pdfMetaResult ? (
                    <div className="text-[0.95rem] text-[color:var(--admin-muted)]">
                      {pdfMetaResult.fileName ? `${pdfMetaResult.fileName}: ` : ""}
                      {pdfMetaResult.shortRef || pdfMetaResult.docId || tr("admin.rag.common.saved")}
                    </div>
                  ) : null}
            </form>

            <div className={articlesClassName}>
                <div className={articlesHeadClassName}>
                  <div>
                    <div className={articlesTitleClassName}>{tr("admin.rag.articles.title")}</div>
                    <div className={articlesNoteClassName}>{tr("admin.rag.articles.subtitle")}</div>
                  </div>
                  <Button
                    as="a"
                    variant="ghost"
                    className={`${buttonBaseClassName} ${buttonGhostClassName}`}
                    href="/rag-meta-templates/articles.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    {tr("admin.rag.articles.open_template")}
                  </Button>
                </div>
                <form className={articlesFormClassName} onSubmit={handleArticlesSubmit} ref={articlesFormRef}>
                  <Input
                    name="articlesDocId"
                    value={articlesDocId}
                    onChange={event => setArticlesDocId(event.target.value)}
                    placeholder={tr("admin.rag.articles.doc_id_placeholder")}
                    size="sm"
                    className={inputClassName}
                  />
                  <input
                    ref={articlesFileInputRef}
                    name="articlesJsonFile"
                    type="file"
                    accept="application/json"
                    className="sr-only"
                    onChange={event => setArticlesJsonFileName(event.target.files?.[0]?.name || "")}
                  />
                  <div className={filePickerClassName}>
                    <Button
                      type="button"
                      size="sm"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName} ${buttonCompactClassName}`}
                      onClick={() => articlesFileInputRef.current?.click()}
                    >
                      Vali fail
                    </Button>
                    <span className={filePickerNameClassName}>{articlesJsonFileName || "Pole valitud JSON faili"}</span>
                  </div>
                  <Textarea
                    name="articlesJsonText"
                    value={articlesJson}
                    onChange={event => setArticlesJson(event.target.value)}
                    placeholder={tr("admin.rag.articles.json_placeholder")}
                    rows={5}
                    size="sm"
                    className={inputClassName}
                  />
                  <div className={articlesActionsClassName}>
                    <Button
                      type="submit"
                      variant="primary"
                      className={`${buttonBaseClassName} ${buttonPrimaryClassName}`}
                      disabled={articlesBusy}
                    >
                      {articlesBusy ? tr("admin.rag.ingest.sending") : tr("admin.rag.articles.send")}
                    </Button>
                  </div>
                  {articlesResult ? (
                    <div className={articlesResultClassName}>
                      {articlesResult.count != null
                        ? tr("admin.rag.articles.added_count", { count: articlesResult.count })
                        : tr("admin.rag.articles.added")}
                      {articlesResult.docId ? ` docId: ${articlesResult.docId}` : ""}
                      {articlesResult.inserted?.length ? (
                        <ul className={articlesListClassName}>
                          {articlesResult.inserted.slice(0, 4).map((item, index) => (
                            <li key={`${item.title || "article"}-${index}`}>
                              {(item.title || tr("admin.rag.articles.default_article")) +
                                (item.startPage && item.endPage
                                  ? tr("admin.rag.articles.page_range", {
                                      start: item.startPage,
                                      end: item.endPage
                                    })
                                  : "")}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </form>
            </div>

            {Array.isArray(selftestSteps) && selftestSteps.length ? (
              <div className={panelStackClassName}>
                <CardTitle>{tr("admin.rag.selftest.results_title")}</CardTitle>
                <ul className="m-0 grid gap-1 pl-4 text-[color:var(--admin-text)]">
                  {selftestSteps.map((step, index) => (
                    <li key={index} className={step.ok ? "text-[color:var(--admin-success)]" : "text-[color:var(--admin-danger)]"}>
                      {step.label || step.step || step.id}: {step.ok ? tr("admin.rag.common.ok") : tr("admin.rag.common.failed")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showMetaGuide ? (
              <div className={metaPanelClassName} id="rag-meta-panel">
                <div className={metaPanelHeadClassName}>
                  <div>
                    <div className={metaPanelTitleClassName}>{tr("admin.rag.meta.templates_title")}</div>
                    <div className={metaPanelNoteClassName}>{tr("admin.rag.meta.templates_note")}</div>
                  </div>
                  {activeMetaTemplate ? (
                    <a className={metaPanelLinkClassName} href={activeMetaTemplate.file} target="_blank" rel="noopener noreferrer" download>
                      {tr("admin.rag.meta.open_json")}
                    </a>
                  ) : null}
                </div>
                <div className={metaPanelGridClassName}>
                  <div>
                    <div className={metaPanelLabelClassName}>{tr("admin.rag.meta.important")}</div>
                    <ul className={metaPanelListClassName}>
                      <li>{tr("admin.rag.meta.important_line_1")}</li>
                      <li>{tr("admin.rag.meta.important_line_2")}</li>
                    </ul>
                  </div>
                  <div>
                    <div className={metaPanelLabelClassName}>{tr("admin.rag.meta.recommended")}</div>
                    <ul className={metaPanelListClassName}>
                      <li>{tr("admin.rag.meta.recommended_line_1")}</li>
                      <li>{tr("admin.rag.meta.recommended_line_2")}</li>
                      <li>{tr("admin.rag.meta.page_range_or_pdf_pages")}</li>
                      <li>{tr("admin.rag.meta.recommended_line_4")}</li>
                    </ul>
                  </div>
                </div>
                <div className={metaTabsClassName}>
                  {metaTemplates.map(template => (
                    <button
                      type="button"
                      key={template.key}
                      className={`${metaTabClassName}${activeMetaTemplate?.key === template.key ? ` ${metaTabActiveClassName}` : ""}`}
                      onClick={() => setActiveMetaTemplateKey(template.key)}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
                <pre className={codeBlockClassName}>{activeMetaTemplateContent || ""}</pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
