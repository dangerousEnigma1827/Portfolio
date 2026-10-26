import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { FileNode, FolderNode } from '../types'

type TreeEntry = FileNode | FolderNode

type FileTreeProps = {
  node: FolderNode
  currentPath: string
  selectedPath: string
  onSelect: (file: FileNode) => void
}

type VisibleEntry = {
  node: TreeEntry
  depth: number
  isLast: boolean
}

function collectFolderPaths(node: FolderNode): string[] {
  return node.children.flatMap((child) => child.type === 'folder' ? [child.path, ...collectFolderPaths(child)] : [])
}

function getVisibleEntries(node: FolderNode, expandedPaths: Set<string>, depth = 0): VisibleEntry[] {
  return node.children.flatMap<VisibleEntry>((child, index) => {
    const entry = { node: child, depth, isLast: index === node.children.length - 1 }
    if (child.type === 'folder' && expandedPaths.has(child.path)) {
      return [entry, ...getVisibleEntries(child, expandedPaths, depth + 1)]
    }
    return [entry]
  })
}

function getParentPath(path: string) {
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
}

function fileIcon(path: string) {
  if (path.endsWith('.json')) return { glyph: '{}', kind: 'json' }
  if (path.endsWith('.pdf')) return { glyph: '▧', kind: 'pdf' }
  if (path.endsWith('.md')) return { glyph: 'M', kind: 'markdown' }
  return { glyph: '·', kind: 'generic' }
}

export function FileTree({ node, currentPath, selectedPath, onSelect }: FileTreeProps) {
  const allFolderPaths = useMemo(() => collectFolderPaths(node), [node])
  const [expandedPaths, setExpandedPaths] = useState(() => new Set(allFolderPaths))
  const [focusedPath, setFocusedPath] = useState(selectedPath || allFolderPaths[0] || '')
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())
  const visibleEntries = useMemo(() => getVisibleEntries(node, expandedPaths), [expandedPaths, node])

  const focusEntry = (entry: VisibleEntry) => {
    setFocusedPath(entry.node.path)
    rowRefs.current.get(entry.node.path)?.focus()
  }

  const toggleFolder = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
    setFocusedPath(path)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, entry: VisibleEntry) => {
    const index = visibleEntries.findIndex(({ node: candidate }) => candidate.path === entry.node.path)
    const node = entry.node
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) event.stopPropagation()

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = event.key === 'ArrowDown' ? Math.min(index + 1, visibleEntries.length - 1) : Math.max(index - 1, 0)
      focusEntry(visibleEntries[nextIndex])
      return
    }

    if (event.key === 'ArrowRight' && node.type === 'folder') {
      event.preventDefault()
      if (!expandedPaths.has(node.path)) toggleFolder(node.path)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (node.type === 'folder' && expandedPaths.has(node.path)) {
        toggleFolder(node.path)
        return
      }
      const parent = getParentPath(node.path)
      const parentEntry = visibleEntries.find(({ node: candidate }) => candidate.path === parent)
      if (parentEntry) focusEntry(parentEntry)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (node.type === 'folder') toggleFolder(node.path)
      else {
        setFocusedPath(node.path)
        onSelect(node)
      }
    }
  }

  return (
    <div className="file-tree" role="tree" aria-label="Portfolio filesystem">
      {visibleEntries.map((entry) => {
        const child = entry.node
        const isFocused = focusedPath === child.path
        const isCurrent = child.type === 'folder' && currentPath === `${child.path}/`
        const treeStyle = { '--tree-depth': entry.depth } as CSSProperties

        if (child.type === 'folder') {
          const expanded = expandedPaths.has(child.path)
          return (
            <div className={`tree-entry depth-${entry.depth} ${entry.isLast ? 'is-last' : ''}`} key={child.path} style={treeStyle}>
              <button
                ref={(element) => {
                  if (element) rowRefs.current.set(child.path, element)
                  else rowRefs.current.delete(child.path)
                }}
                className={`tree-folder-row ${isCurrent ? 'is-current' : ''} ${isFocused ? 'is-focused' : ''}`}
                type="button"
                role="treeitem"
                aria-level={entry.depth + 1}
                data-path={child.path}
                aria-expanded={expanded}
                aria-current={isCurrent ? 'location' : undefined}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => toggleFolder(child.path)}
                onFocus={() => setFocusedPath(child.path)}
                onKeyDown={(event) => handleKeyDown(event, entry)}
              >
                <span className="folder-mark" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                <span>{child.label}/</span>
              </button>
            </div>
          )
        }

        const icon = fileIcon(child.path)
        return (
          <div className={`tree-entry depth-${entry.depth} ${entry.isLast ? 'is-last' : ''}`} key={child.path} style={treeStyle}>
            <button
              ref={(element) => {
                if (element) rowRefs.current.set(child.path, element)
                else rowRefs.current.delete(child.path)
              }}
              className={`tree-file ${child.path === selectedPath ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''}`}
              type="button"
              role="treeitem"
              aria-level={entry.depth + 1}
              data-path={child.path}
              aria-selected={child.path === selectedPath}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => {
                setFocusedPath(child.path)
                onSelect(child)
              }}
              onFocus={() => setFocusedPath(child.path)}
              onKeyDown={(event) => handleKeyDown(event, entry)}
              title={child.description}
            >
              <span className={`file-mark file-mark-${icon.kind}`} aria-hidden="true">{icon.glyph}</span>
              <span>{child.label}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
