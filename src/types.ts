export type ViewId = 'home' | 'about' | 'projects' | 'skills' | 'resume' | 'contact'

export type ProjectKey = 'dairix' | 'smarttrace' | 'novasync'

export type ProjectDetailConfig = {
  title: string
  imageSource?: string
  description: string
}

export type SkillCategory = {
  label: string
  skills: string[]
}

export type ContactLink = {
  key: 'linkedin' | 'github' | 'codeforces' | 'email'
  label: string
  href: string
  value: string
}

export type FileNode = {
  type: 'file'
  path: string
  label: string
  view: ViewId
  description: string
  content: string
}

export type FolderNode = {
  type: 'folder'
  path: string
  label: string
  children: Array<FileNode | FolderNode>
}

export type NavigationItem = {
  id: ViewId
  label: string
  path: string
  description: string
  eyebrow: string
}

export type CommandItem = NavigationItem & {
  keywords: string[]
}
