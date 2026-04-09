"use client";

import Button from "@/components/ui/Button";
import CardTitle from "@/components/ui/CardTitle";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import DocumentsDropdown from "@/components/documents/DocumentsDropdown";

import {
  buttonBaseClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  dropdownClassName,
  inputClassName,
  modalBodyClassName,
  panelStackClassName,
  ragModalHeadClassName,
  readOnlyFieldClassName
} from "./ragAdminShared";

export default function RagAdminDetailModal({ controller }) {
  const {
    tr,
    detailDoc,
    detailForm,
    setDetailForm,
    audienceSelectOptions,
    closeDetail,
    saveDetail
  } = controller;

  if (!detailDoc) return null;

  return (
    <Modal open={true} variant="glass" onClose={closeDetail} closeOnOverlayClick>
      <div className={modalBodyClassName}>
        <div className={ragModalHeadClassName}>
          <div>
            <CardTitle>{tr("admin.rag.modal.edit_meta")}</CardTitle>
            <div className="text-[0.95rem] text-[color:var(--admin-muted)]">
              {detailDoc.title || tr("admin.rag.documents.untitled")}
            </div>
          </div>
          <Button variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName}`} onClick={closeDetail}>
            {tr("admin.rag.actions.close")}
          </Button>
        </div>
        <div className={panelStackClassName}>
          <Input
            value={detailForm.title}
            onChange={event => setDetailForm(form => ({ ...form, title: event.target.value }))}
            className={inputClassName}
            size="sm"
          />
          <Textarea
            value={detailForm.description}
            onChange={event => setDetailForm(form => ({ ...form, description: event.target.value }))}
            className={inputClassName}
            size="sm"
            rows={3}
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
            <Input
              value={detailForm.authors}
              onChange={event => setDetailForm(form => ({ ...form, authors: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.tags}
              onChange={event => setDetailForm(form => ({ ...form, tags: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
            <Input
              value={detailForm.section}
              onChange={event => setDetailForm(form => ({ ...form, section: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.issueLabel}
              onChange={event => setDetailForm(form => ({ ...form, issueLabel: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.year}
              onChange={event => setDetailForm(form => ({ ...form, year: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
            <Input
              value={detailForm.issueId}
              onChange={event => setDetailForm(form => ({ ...form, issueId: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.journalTitle}
              onChange={event => setDetailForm(form => ({ ...form, journalTitle: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.articleId}
              onChange={event => setDetailForm(form => ({ ...form, articleId: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
            <DocumentsDropdown
              ariaLabel={tr("admin.rag.document_detail.audience")}
              value={detailForm.audience}
              onChange={nextAudience => setDetailForm(form => ({ ...form, audience: nextAudience }))}
              options={audienceSelectOptions}
              className={dropdownClassName}
            />
            <Input
              value={detailForm.pageRange}
              onChange={event => setDetailForm(form => ({ ...form, pageRange: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <Input
              value={detailForm.pdf_start_page}
              onChange={event => setDetailForm(form => ({ ...form, pdf_start_page: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
            <Input
              value={detailForm.pdf_end_page}
              onChange={event => setDetailForm(form => ({ ...form, pdf_end_page: event.target.value }))}
              className={inputClassName}
              size="sm"
            />
            <div className={readOnlyFieldClassName}>{tr("admin.rag.modal.doc_id")}: {detailDoc.docId || "-"}</div>
            <div className={readOnlyFieldClassName}>{tr("admin.rag.modal.type")}: {detailDoc.source_type || detailDoc.type || "-"}</div>
            <div className={readOnlyFieldClassName}>{tr("admin.rag.modal.language")}: {detailDoc.language || "-"}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" className={`${buttonBaseClassName} ${buttonPrimaryClassName}`} onClick={saveDetail}>
              {tr("admin.rag.actions.save")}
            </Button>
            <Button variant="primary" className={`${buttonBaseClassName} ${buttonSecondaryClassName}`} onClick={closeDetail}>
              {tr("admin.rag.actions.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
