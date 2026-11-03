import type { CommandItem, FileNode, FolderNode, NavigationItem } from '../types'
import { identity, projectDetails, projectDocumentation } from './content'

export { projectDetails }

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Terminal home', path: '~', description: 'Return to the command center.', eyebrow: 'session / home' },
  { id: 'about', label: 'About', path: 'about/README.md', description: identity.tagline, eyebrow: 'about / README.md' },
  { id: 'projects', label: 'Projects', path: 'projects/', description: 'Browse Dairix, SmartTrace, and NovaSync.', eyebrow: 'projects / index' },
  { id: 'skills', label: 'Skills & stack', path: 'skills/stack.json', description: 'Languages, frameworks, infrastructure, and tools.', eyebrow: 'skills / stack.json' },
  { id: 'resume', label: 'Resume', path: 'resume/Muneeb.pdf', description: 'Download the verified resume document.', eyebrow: 'resume / Muneeb.pdf' },
  { id: 'contact', label: 'Contact', path: 'contact/README.md', description: 'Find the verified ways to get in touch.', eyebrow: 'contact / README.md' },
]

export const commandItems: CommandItem[] = [
  ...navigationItems.map((item) => ({ ...item, keywords: [item.label, item.path, item.description] })),
  { id: 'projects' as const, label: 'Dairix', path: 'projects/dairix/README.md', description: 'Dairy subscription & delivery coordination system.', eyebrow: 'projects / dairix', keywords: ['dairix', 'dairy', 'delivery', 'projects'] },
  { id: 'projects' as const, label: 'SmartTrace', path: 'projects/smarttrace/README.md', description: 'Pharmaceutical anti-counterfeit & serialization tracking.', eyebrow: 'projects / smarttrace', keywords: ['smarttrace', 'pharma', 'security', 'projects'] },
  { id: 'projects' as const, label: 'NovaSync', path: 'projects/novasync/README.md', description: 'Expense splitting & debt minimization platform.', eyebrow: 'projects / novasync', keywords: ['novasync', 'expense', 'splitting', 'debts', 'finance', 'projects'] },
]

export const fileTree: FolderNode = {
  type: 'folder', path: '', label: 'dangerousEnigma.dev', children: [
    {
      type: 'folder', path: 'about', label: 'about', children: [
        { type: 'file', path: 'about/README.md', label: 'README.md', view: 'about', description: identity.tagline, content: `${identity.name}\n\n${identity.tagline}\n\n${identity.about}` },
      ],
    },
    {
      type: 'folder', path: 'projects', label: 'projects', children: [
        {
          type: 'folder', path: 'projects/dairix', label: 'dairix', children: [
            { type: 'file', path: 'projects/dairix/README.md', label: 'README.md', view: 'projects', description: 'Dairix introduction and technical overview.', content: projectDocumentation.dairix.readme },
          ],
        },
        {
          type: 'folder', path: 'projects/smarttrace', label: 'smarttrace', children: [
            { type: 'file', path: 'projects/smarttrace/README.md', label: 'README.md', view: 'projects', description: 'SmartTrace introduction and technical overview.', content: projectDocumentation.smarttrace.readme },
          ],
        },
        {
          type: 'folder', path: 'projects/novasync', label: 'novasync', children: [
            { type: 'file', path: 'projects/novasync/README.md', label: 'README.md', view: 'projects', description: 'NovaSync introduction and technical overview.', content: projectDocumentation.novasync.readme },
          ],
        },
      ],
    },
    {
      type: 'folder', path: 'skills', label: 'skills', children: [
        { type: 'file', path: 'skills/stack.json', label: 'stack.json', view: 'skills', description: 'Languages, frameworks, infrastructure, and tools.', content: 'Programming Languages: C, C++, Python, JavaScript, TypeScript\nFrontend Development: React, Next.js, Tailwind CSS\nBackend Development: Node.js, Express.js, WebSockets\nDatabases & Caching: Redis\nTools & Platforms: Docker, Postman, Linux' },
      ],
    },
    {
      type: 'folder', path: 'resume', label: 'resume', children: [
        { type: 'file', path: 'resume/Muneeb.pdf', label: 'Muneeb.pdf', view: 'resume', description: 'Verified resume download link.', content: 'Resume link: https://drive.google.com/drive/folders/1hqVxV-c_J_UU1qGBtN0P00X4yLdZ31z7?usp=sharing' },
      ],
    },
    {
      type: 'folder', path: 'contact', label: 'contact', children: [
        { type: 'file', path: 'contact/README.md', label: 'README.md', view: 'contact', description: 'Verified contact methods.', content: 'LinkedIn\nGitHub\nCodeforces\nEmail' },
      ],
    },
  ],
}

export function findNavigationItem(view: string) {
  return navigationItems.find((item) => item.id === view) ?? navigationItems[0]
}

export function flattenFiles(node: FolderNode): FileNode[] {
  return node.children.flatMap((child) => child.type === 'file' ? [child] : flattenFiles(child))
}

const virtualFiles = flattenFiles(fileTree)

export function normalizeVirtualPath(path: string) {
  const raw = path.trim().replaceAll('\\', '/').replace(/^~\/?/, '').replace(/^\/+/, '')
  const parts = raw.split('/').filter(Boolean)
  const normalized: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') normalized.pop()
    else normalized.push(part)
  }
  return normalized.join('/')
}

export function virtualDirectoryPath(path: string) {
  const normalized = normalizeVirtualPath(path)
  if (!normalized) return ''
  if (path.trim().endsWith('/')) return `${normalized}/`
  const lastSlash = normalized.lastIndexOf('/')
  return lastSlash < 0 ? '' : `${normalized.slice(0, lastSlash)}/`
}

export function findVirtualFile(path: string) {
  const normalized = normalizeVirtualPath(path)
  return virtualFiles.find((file) => file.path === normalized)
}

export function findVirtualDirectory(path: string) {
  const normalized = normalizeVirtualPath(path)
  if (!normalized) return true
  return virtualFiles.some((file) => file.path.startsWith(`${normalized}/`))
}

export function listVirtualDirectory(path: string) {
  const directory = normalizeVirtualPath(path)
  const prefix = directory ? `${directory}/` : ''
  const entries = new Set<string>()
  virtualFiles.forEach((file) => {
    if (!file.path.startsWith(prefix)) return
    const remainder = file.path.slice(prefix.length)
    const [entry, ...rest] = remainder.split('/')
    if (entry) entries.add(rest.length > 0 ? `${entry}/` : entry)
  })
  return Array.from(entries).sort((left, right) => left.localeCompare(right))
}

export function resolveVirtualFile(target: string, currentPath = '') {
  const normalizedTarget = normalizeVirtualPath(target)
  const currentDirectory = virtualDirectoryPath(currentPath)
  const localMatch = findVirtualFile(`${currentDirectory}${normalizedTarget}`)
  if (localMatch) return localMatch
  return findVirtualFile(normalizedTarget) ?? virtualFiles.find((file) => file.path.split('/').at(-1) === normalizedTarget)
}

export function virtualTreeText() {
  const lines: string[] = [`${fileTree.label}/`]
  const append = (node: FolderNode, prefix: string) => {
    node.children.forEach((child, index) => {
      const isLast = index === node.children.length - 1
      const branch = isLast ? '└─ ' : '├─ '
      lines.push(`${prefix}${branch}${child.label}${child.type === 'folder' ? '/' : ''}`)
      if (child.type === 'folder') append(child, `${prefix}${isLast ? '   ' : '│  '}`)
    })
  }
  append(fileTree, '')
  return lines.join('\n')
}
