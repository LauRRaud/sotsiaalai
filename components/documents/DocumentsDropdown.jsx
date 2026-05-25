"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

function DropdownChevron({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`documents-dropdown-icon ${open ? "is-open" : ""}`} fill="none">
      <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[1rem] w-[1rem] shrink-0" fill="none">
      <path d="M4.5 10 8 13.5 15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DocumentsDropdown({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  disabled = false,
  className = "",
  menuClassName = "",
  align = "start",
  openDirection = "down",
  portal = false
}) {
  const [open, setOpen] = useState(false)
  const [portalStyle, setPortalStyle] = useState(null)
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value) || null
  const updatePortalPosition = useCallback(() => {
    if (!portal || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const gap = 2
    const width = Math.max(rect.width, 1)
    const left = align === "end" ? rect.right - width : rect.left
    const style = {
      position: "fixed",
      left: `${Math.max(8, left)}px`,
      width: `${Math.min(width, window.innerWidth - 16)}px`,
      minWidth: `${Math.min(width, window.innerWidth - 16)}px`,
      maxWidth: `${Math.min(width, window.innerWidth - 16)}px`,
      zIndex: 10000
    }
    if (openDirection === "up") {
      style.bottom = `${Math.max(8, window.innerHeight - rect.top + gap)}px`
    } else {
      style.top = `${Math.min(window.innerHeight - 8, rect.bottom + gap)}px`
    }
    setPortalStyle(style)
  }, [align, openDirection, portal])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      const target = event?.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!disabled) return
    setOpen(false)
  }, [disabled])

  useLayoutEffect(() => {
    if (!open || !portal) return undefined
    updatePortalPosition()
    const onLayoutChange = () => updatePortalPosition()
    window.addEventListener("resize", onLayoutChange)
    window.addEventListener("scroll", onLayoutChange, true)
    return () => {
      window.removeEventListener("resize", onLayoutChange)
      window.removeEventListener("scroll", onLayoutChange, true)
    }
  }, [open, portal, updatePortalPosition])

  const menu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      aria-label={ariaLabel}
      className={`documents-dropdown-menu ${portal ? "documents-dropdown-menu--portal" : ""} ${menuClassName}`.trim()}
      style={portal ? portalStyle || undefined : undefined}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={value === option.value ? "true" : "false"}
          className={`documents-dropdown-item ${value === option.value ? "is-active" : ""}`}
          onClick={() => {
            setOpen(false)
            if (option.value !== value) onChange(option.value)
          }}
        >
          <span>{option.label}</span>
          {value === option.value ? <CheckIcon /> : null}
        </button>
      ))}
    </div>
  ) : null

  return (
    <div ref={rootRef} className={`documents-dropdown documents-dropdown--align-${align} documents-dropdown--open-${openDirection} ${open ? "is-open" : ""} ${className}`.trim()}>
      <button
        type="button"
        className={`documents-field documents-dropdown-trigger ${open ? "is-open" : ""}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        disabled={disabled}
        onClick={() => setOpen((current) => (disabled ? false : !current))}
      >
        <span className={`documents-dropdown-label ${selectedOption ? "" : "is-placeholder"}`}>{selectedOption?.label || placeholder}</span>
        <DropdownChevron open={open} />
      </button>
      {portal ? (typeof document === "undefined" ? null : createPortal(menu, document.body)) : menu}
    </div>
  )
}
