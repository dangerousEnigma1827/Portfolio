import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import {
  SiC,
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostman,
  SiPython,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'
import { TbPlugConnected } from 'react-icons/tb'
import { BootScreen } from './components/BootScreen'
import { CommandPalette } from './components/CommandPalette'
import { CustomCursor } from './components/CustomCursor'
import { FileTree } from './components/FileTree'
import { TerminalEntry } from './components/TerminalEntry'
import { TerminalShell } from './components/TerminalShell'
import {
  commandItems,
  fileTree,
  findNavigationItem,
  findVirtualDirectory,
  findVirtualFile,
  flattenFiles,
  listVirtualDirectory,
  normalizeVirtualPath,
  resolveVirtualFile,
  virtualDirectoryPath,
  virtualTreeText,
} from './data/navigation'
import { useBootSequence } from './hooks/useBootSequence'
import { useResponsiveViewport } from './hooks/useResponsiveViewport'
import { useModalFocus } from './hooks/useModalFocus'
import { contacts, identity, projectDetails, resumeConfig, skillCategories } from './data/content'
import type { CommandItem, FileNode, ProjectKey, ViewId } from './types'
import './App.css'

function App() {
  const { isComplete, visibleLines, bootLines, skip } = useBootSequence()
  const shellRef = useRef<HTMLDivElement>(null)
  const explorerRef = useRef<HTMLElement>(null)
  const compact = useResponsiveViewport()
  const [explorerOpen, setExplorerOpen] = useState(false)
  const drawerOpen = compact && explorerOpen
  useModalFocus(drawerOpen, explorerRef, () => setExplorerOpen(false))
  const [mode, setMode] = useState<'entry' | 'workspace'>('entry')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activeView, setActiveView] = useState<ViewId>('about')
  const [activePath, setActivePath] = useState('about/')
  const [selectedPath, setSelectedPath] = useState('about/README.md')
  const [notice, setNotice] = useState('')
  const [fullscreenActive, setFullscreenActive] = useState(false)
  const [fullscreenSupported, setFullscreenSupported] = useState(false)
  const activeItem = findNavigationItem(activeView)
  const files = useMemo(() => flattenFiles(fileTree), [])

  useEffect(() => {
    const root = shellRef.current
    const supported = Boolean(document.fullscreenEnabled && root?.requestFullscreen)
    setFullscreenSupported(supported)

    const handleFullscreenChange = () => {
      setFullscreenActive(document.fullscreenElement === root)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isComplete, mode])

  const toggleFullscreen = useCallback(async () => {
    const root = shellRef.current
    if (!root || !fullscreenSupported) {
      setNotice('fullscreen is unavailable in this browser')
      return
    }

    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await root.requestFullscreen()
    } catch {
      setNotice('fullscreen could not be enabled; use the browser controls instead')
    }
  }, [fullscreenSupported])

  const navigateTo = useCallback((item: CommandItem | FileNode) => {
    setActiveView('type' in item ? item.view : item.id)
    setActivePath(item.path === '~' ? '' : virtualDirectoryPath(item.path))
    setSelectedPath(item.path)
    setPaletteOpen(false)
    setExplorerOpen(false)
    setNotice('')
  }, [])

  const navigateToDirectory = useCallback((path: string) => {
    setExplorerOpen(false)
    const normalized = normalizeVirtualPath(path)
    if (!normalized) {
      setActiveView('home')
      setActivePath('')
      setSelectedPath('')
      setNotice('')
      return
    }

    if (normalized === 'projects' || normalized.startsWith('projects/')) {
      const projectKey = normalized.split('/')[1]
      const projectFile = files.find((file) => file.path.startsWith(`projects/${projectKey}/`))
      setActiveView('projects')
      setActivePath(projectKey ? `projects/${projectKey}/` : 'projects/')
      setSelectedPath(projectFile?.path ?? '')
      setPaletteOpen(false)
      setNotice('')
      return
    }

    if (normalized === 'about') {
      const readme = files.find((file) => file.path === 'about/README.md')
      if (readme) navigateTo(readme)
      return
    }

    if (normalized === 'skills') {
      const stack = files.find((file) => file.path === 'skills/stack.json')
      setActiveView('skills')
      setActivePath('skills/')
      setSelectedPath(stack?.path ?? '')
      setPaletteOpen(false)
      setNotice('')
      return
    }

    if (normalized === 'resume' || normalized === 'contact') {
      const file = files.find((candidate) => candidate.path.startsWith(`${normalized}/`))
      if (file) navigateTo(file)
      return
    }

    setNotice(`cd: no such directory: ${path}`)
  }, [files, navigateTo])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || mode !== 'workspace' || drawerOpen) return
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (((event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) && !isTyping) {
        event.preventDefault()
        setPaletteOpen(true)
      }
      if (event.key === 'Escape') setPaletteOpen(false)

      if (mode !== 'workspace' || isTyping || paletteOpen) return
      if (event.key === 'Escape' && activeView !== 'home' && !document.fullscreenElement) {
        event.preventDefault()
        setActiveView('home')
        setActivePath('')
        setSelectedPath('')
        setNotice('')
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [activeView, mode, paletteOpen, drawerOpen])

  const runCommand = (command: string) => {
    const rawCommand = command.trim().replace(/^\//, '')
    const [rawVerb, ...rest] = rawCommand.split(/\s+/)
    const normalized = rawCommand.toLowerCase()
    const verb = rawVerb.toLowerCase()
    const target = rest.join(' ')

    if (normalized === 'help') {
      setNotice('help  ls  tree  pwd  cd  cat  open  projects  about  clear')
      return
    }
    if (normalized === 'clear') {
      setNotice('')
      return
    }
    if (normalized === 'pwd') {
      setNotice(`~/${activePath}`)
      return
    }
    if (normalized === 'ls') {
      setNotice(listVirtualDirectory(activePath).join('   ') || '(empty)')
      return
    }
    if (normalized === 'tree') {
      setNotice(virtualTreeText())
      return
    }
    if (normalized === 'projects') {
      navigateToDirectory('projects')
      return
    }
    if (['dairix', 'smarttrace', 'novasync'].includes(normalized)) {
      navigateToDirectory(`projects/${normalized}`)
      return
    }
    if (normalized === 'about') {
      navigateToDirectory('about')
      return
    }
    if (verb === 'cd') {
      const requestedPath = target === 'portfolio' ? '' : normalizeVirtualPath(target)
      if (!requestedPath) {
        navigateToDirectory('')
        return
      }
      if (findVirtualFile(requestedPath)) {
        setNotice(`cd: not a directory: ${target}`)
        return
      }
      if (findVirtualDirectory(requestedPath)) {
        navigateToDirectory(requestedPath)
        return
      }
      setNotice(`cd: no such directory: ${target}`)
      return
    }
    if (verb === 'cat') {
      const file = resolveVirtualFile(target, activePath)
      setNotice(file ? `${file.path}\n${file.content}` : `cat: file not found: ${target}`)
      return
    }
    if (verb === 'open') {
      const projectKey = target.toLowerCase()
      const project = files.find((file) => file.view === 'projects' && file.path.split('/')[1] === projectKey)
      if (project) {
        navigateToDirectory(`projects/${projectKey}`)
        return
      }
      const file = resolveVirtualFile(target, activePath)
      if (file) {
        navigateTo(file)
        return
      }
      setNotice(`open: no such item: ${target}`)
      return
    }

    const match = commandItems.find((item) => item.id === normalized || item.label.toLowerCase() === normalized || item.path.startsWith(normalized))
    if (match) {
      navigateTo(match)
      return
    }
    setNotice(`command not found: ${command}. try help`)
  }

  if (!isComplete && mode === 'entry') {
    return <><CustomCursor /><BootScreen lines={bootLines} visibleLines={visibleLines} onSkip={skip} /></>
  }

  if (mode === 'entry') {
    return <><CustomCursor /><TerminalEntry onEnterWorkspace={() => setMode('workspace')} /></>
  }

  return (
    <div className="app-shell" ref={shellRef}>
      <CustomCursor />
      <div className="ambient-grid" aria-hidden="true" />
      <TerminalShell
        onOpenPalette={() => setPaletteOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        fullscreenActive={fullscreenActive}
        fullscreenSupported={fullscreenSupported}
        explorerOpen={drawerOpen}
        onToggleExplorer={() => setExplorerOpen((open) => !open)}
        modalOpen={drawerOpen || paletteOpen}
      >
        <div className="shell-body">
          {drawerOpen && <div className="explorer-backdrop" onClick={() => setExplorerOpen(false)} aria-hidden="true" />}
          <aside ref={explorerRef} id="portfolio-explorer" className={`sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Portfolio file explorer"
            role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen ? true : undefined}
            inert={paletteOpen || (compact && !drawerOpen)}>
            <div className="sidebar-heading">
              <span className="eyebrow">workspace</span>
              <span className="live-dot" aria-label="online" />
              <button className="explorer-close" type="button" onClick={() => setExplorerOpen(false)}>Close files</button>
            </div>
            <div className="sidebar-tree-scroll">
              <div className={`tree-root ${activePath === '' ? 'is-current' : ''}`}><span aria-hidden="true">▾</span> {fileTree.label}/</div>
              <div className="cwd-display"><span>cwd</span><strong>~/{activePath}</strong></div>
              <FileTree node={fileTree} currentPath={activePath} selectedPath={selectedPath} onSelect={navigateTo} />
            </div>
            <div className="sidebar-footer">
              <span className="status-pip" aria-hidden="true" />
              <span>static / available</span>
            </div>
          </aside>

          <section className="terminal-content" inert={drawerOpen || paletteOpen}>
            <div className="breadcrumb"><span>~/</span>{activePath}</div>
            <div className="view-stage" tabIndex={0} aria-label="Portfolio content">
              {activeView === 'home' ? (
                <HomeScreen />
              ) : (
                <DetailScreen
                  item={activeItem}
                  activePath={activePath}
                  onBack={() => { setActiveView('home'); setActivePath(''); setSelectedPath('') }}
                  onNavigateDirectory={navigateToDirectory}
                />
              )}
            </div>
            <div className="terminal-dock">
              <WorkspaceCommandBar onRunCommand={runCommand} />
              {notice && <div className="terminal-notice" role="log" aria-live="polite" tabIndex={0} aria-label="Workspace command output"><span aria-hidden="true">›</span>{notice}</div>}
            </div>
          </section>
        </div>
        <footer className="terminal-footer" inert={drawerOpen || paletteOpen}>
          <details className="shortcut-help" open={!compact}>
            <summary>Keyboard shortcuts</summary>
            <div className="footer-shortcuts">
              <span className="footer-shortcut"><kbd>↑</kbd><kbd>↓</kbd> Move selection</span>
              <span className="footer-shortcut"><kbd>Enter</kbd> Open selected item</span>
              <span className="footer-shortcut"><kbd>Esc</kbd> Go back / Close menu</span>
              <span className="footer-shortcut"><kbd>/</kbd> Open command palette</span>
              <span className="footer-shortcut"><kbd>Tab</kbd> Move to next area</span>
            </div>
          </details>
          <span className="footer-right">build 01 <span aria-hidden="true">·</span> no tracking</span>
        </footer>
      </TerminalShell>
      {paletteOpen && <CommandPalette items={commandItems} onSelect={navigateTo} onClose={() => setPaletteOpen(false)} />}
    </div>
  )
}

function HomeScreen() {
  return (
    <div className="home-screen">
      <div className="home-intro">
        <div className="signal-line"><span className="signal-mark">◒</span> workspace mounted / 06 routes available</div>
        <p className="eyebrow">dangerousEnigma.dev / workspace</p>
        <h1>The workspace<br /><span>is ready.</span></h1>
        <p className="home-lede">Use the filesystem, command prompt, or palette to inspect the system and move between routes.</p>
      </div>
      <div className="home-meta">
        <div><span className="meta-label">current mode</span><strong>explore / discover</strong></div>
        <div><span className="meta-label">available routes</span><strong>06 destinations</strong></div>
        <div><span className="meta-label">last updated</span><strong>foundation build</strong></div>
      </div>
    </div>
  )
}

function WorkspaceCommandBar({ onRunCommand }: { onRunCommand: (command: string) => void }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const submit = () => {
    if (!input.trim()) return
    setHistory((current) => [...current, input.trim()])
    setHistoryIndex(-1)
    onRunCommand(input)
    setInput('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHistoryIndex((current) => {
        const nextIndex = Math.min(current + 1, history.length - 1)
        setInput(history[history.length - 1 - nextIndex] ?? '')
        return nextIndex
      })
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHistoryIndex((current) => {
        const nextIndex = Math.max(current - 1, -1)
        setInput(nextIndex === -1 ? '' : history[history.length - 1 - nextIndex] ?? '')
        return nextIndex
      })
    }
    if (event.key === 'Escape') {
      setInput('')
      setHistoryIndex(-1)
    }
  }

  return (
    <form className="command-line" aria-label="Workspace command prompt" onSubmit={(event) => { event.preventDefault(); submit() }}>
      <span className="command-prompt" aria-hidden="true">dangerousEnigma@dev:~$</span>
      <input aria-label={historyIndex >= 0 ? 'Run a workspace command from history' : 'Run a workspace command'} value={input} onChange={(event) => setInput(event.target.value)} placeholder="type a command..." onKeyDown={handleKeyDown} enterKeyHint="send" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" />
      <span className="cursor-block" aria-hidden="true" />
      <button className="command-submit" type="submit" aria-label="Run command">↵</button>
    </form>
  )
}

function DetailScreen({ item, activePath, onBack, onNavigateDirectory }: { item: ReturnType<typeof findNavigationItem>; activePath: string; onBack: () => void; onNavigateDirectory: (path: string) => void }) {
  const projectKey = activePath.split('/')[1] as ProjectKey | undefined
  const project = projectKey && projectKey in projectDetails ? projectDetails[projectKey] : undefined
  return (
    <div className="detail-screen">
      <div className="detail-heading">
        <span className="eyebrow">{item.eyebrow}</span>
        <button className="back-button" type="button" onClick={onBack}>← workspace</button>
      </div>
      {item.id === 'about' ? (
        <AboutPanel />
      ) : item.id === 'projects' ? (
        project ? (
          <ProjectDetail config={project} currentKey={projectKey} onSelectProject={(key) => onNavigateDirectory(`projects/${key}`)} />
        ) : (
          <ProjectsIndex onSelectProject={(key) => onNavigateDirectory(`projects/${key}`)} />
        )
      ) : item.id === 'contact' ? (
        <ContactPanel />
      ) : item.id === 'resume' ? (
        <ResumePanel />
      ) : (
        <>
          <TerminalHeading>{item.label}</TerminalHeading>
          <p className="detail-lede">{item.description}</p>
          {item.id === 'skills' ? (
            <TechSignals />
          ) : (
            <div className="content-placeholder">
              <span className="placeholder-bracket">{'{'} </span>
              <div>
                <p className="placeholder-title">content module staged</p>
                <p>This route is wired into the shared navigation system. Verified portfolio content can be added here without changing the shell.</p>
              </div>
              <span className="placeholder-bracket"> {'}'}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AboutPanel() {
  return (
    <div className="about-panel">
      <TerminalHeading>{identity.name}</TerminalHeading>
      <p className="about-copy">{identity.about}</p>
      {/* <div className="about-facts" aria-label="About Muneeb">
        <div><span>focus</span><strong>Mathematics · problem-solving · learning</strong></div>
        <div><span>study</span><strong>Computer Science · IIT (ISM) Dhanbad</strong></div>
        <div><span>outside code</span><strong>Guitar · music</strong></div>
      </div> */}
      <p className="about-navigation-hint">Browse Projects, Skills, Resume, and Contact with the explorer, command line, or <kbd>/</kbd> palette.</p>
    </div>
  )
}

function ResumePanel() {
  return (
    <div className="resume-panel">
      <TerminalHeading>Resume</TerminalHeading>
      <p className="detail-lede">{resumeConfig.href ? 'Download the latest verified resume.' : 'The resume destination will be configured here when the verified PDF or URL is available.'}</p>
      {resumeConfig.href ? (
        <a className="resume-button" href={resumeConfig.href} target="_blank" rel="noreferrer">{resumeConfig.label}</a>
      ) : (
        <button className="resume-button" type="button" disabled title="Resume URL is not configured yet">{resumeConfig.label}</button>
      )}
    </div>
  )
}

function ContactPanel() {
  return (
    <div className="contact-panel">
      <TerminalHeading>Contact</TerminalHeading>
      <p className="detail-lede">Reach me through one of these verified routes.</p>
      <div className="contact-grid">
        {contacts.map((contact) => (
          <a className={`contact-link contact-link-${contact.key}`} key={contact.key} href={contact.href} target={contact.key === 'email' ? undefined : '_blank'} rel={contact.key === 'email' ? undefined : 'noreferrer'}>
            <ContactIcon name={contact.key} />
            <span><strong>{contact.label}</strong><small>{contact.value}</small></span>
          </a>
        ))}
      </div>
    </div>
  )
}

function ProjectDetail({
  config,
  currentKey,
  onSelectProject,
}: {
  config: { title: string; imageSource?: string; description: string }
  currentKey?: ProjectKey
  onSelectProject?: (key: ProjectKey) => void
}) {
  const title = config.title
  const imageSource = config.imageSource
  return (
    <div className="project-detail">
      <TerminalHeading>{title}</TerminalHeading>
      <p className="project-detail-description">{config.description}</p>
      {imageSource ? (
        <img className="project-image-placeholder" src={imageSource} alt={`${title} project preview`} />
      ) : (
        <div className="project-image-placeholder" role="img" aria-label={`${title} project image placeholder`}>
          <span>PROJECT IMAGE<br /><small>Replace with project screenshot</small></span>
        </div>
      )}
      {onSelectProject && (
        <div className="project-switcher" aria-label="Switch project">
          {(Object.keys(projectDetails) as ProjectKey[]).map((key) => {
            const isCurrent = key === currentKey
            return (
              <button
                key={key}
                type="button"
                className={`project-switch-button ${isCurrent ? 'is-active' : ''}`}
                onClick={() => onSelectProject(key)}
              >
                {projectDetails[key].title}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjectsIndex({ onSelectProject }: { onSelectProject: (key: ProjectKey) => void }) {
  const keys = Object.keys(projectDetails) as ProjectKey[]
  return (
    <div className="projects-index">
      <TerminalHeading>PROJECTS</TerminalHeading>
      <p className="detail-lede">Select a project directory to inspect its documentation and preview.</p>
      <div className="projects-grid">
        {keys.map((key) => {
          const config = projectDetails[key]
          return (
            <button
              key={key}
              type="button"
              className="project-card"
              onClick={() => onSelectProject(key)}
            >
              {config.imageSource && (
                <img className="project-card-thumb" src={config.imageSource} alt={`${config.title} thumbnail`} />
              )}
              <div className="project-card-header">
                <span className="project-card-path">~/projects/{key}/</span>
                <span className="project-card-action">inspect →</span>
              </div>
              <h3 className="project-card-title">{config.title}</h3>
              <p className="project-card-desc">{config.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TechSignals() {
  return (
    <div className="tech-signals" aria-label="Technology skills">
      {skillCategories.map((category) => (
        <section className="skill-category" key={category.label}>
          <h3>{category.label}</h3>
          <div className="tech-signal-grid">
            {category.skills.map((label) => {
              const key = iconKey(label)
              return <div className={`tech-signal tech-signal-${key}`} key={label}><TechIcon name={key} /><span>{label}</span></div>
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function TerminalHeading({ children }: { children: ReactNode }) {
  return <h2 className="terminal-heading"><span className="heading-prompt" aria-hidden="true">›</span>{children}<span className="heading-cursor" aria-hidden="true" /></h2>
}

function iconKey(label: string) {
  return label.toLowerCase().replaceAll('+', 'plus').replaceAll('.', '').replaceAll(' ', '-')
}

function ContactIcon({ name }: { name: string }) {
  if (name === 'linkedin') return <svg className="contact-icon contact-icon-linkedin" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.2 8.4H1.8V22h3.4V8.4ZM3.5 2A2 2 0 1 0 3.5 6 2 2 0 0 0 3.5 2ZM22.2 14.2c0-4.1-2.2-6-5.2-6-2.4 0-3.5 1.3-4.1 2.2V8.4H9.5V22H13v-6.7c0-1.8.3-3.6 2.6-3.6 2.2 0 2.2 2.1 2.2 3.7V22h3.4v-7.8Z" /></svg>
  if (name === 'github') return <svg className="contact-icon contact-icon-github" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 7.91c.85 0 1.7.11 2.49.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
  if (name === 'codeforces') return <svg className="contact-icon contact-icon-codeforces" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 19h3V9H4v10Zm6 0h3V5h-3v14Zm6 0h3V2h-3v17Z" /></svg>
  return <svg className="contact-icon contact-icon-email" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3v.3l9 5.4 9-5.4V8l-9 5.4L3 8Z" /></svg>
}

function TechIcon({ name }: { name: string }) {
  const skillIcons: Record<string, IconType> = {
    c: SiC,
    cplusplus: SiCplusplus,
    python: SiPython,
    javascript: SiJavascript,
    typescript: SiTypescript,
    react: SiReact,
    nextjs: SiNextdotjs,
    'tailwind-css': SiTailwindcss,
    nodejs: SiNodedotjs,
    expressjs: SiExpress,
    websockets: TbPlugConnected,
    redis: SiRedis,
    mongodb: SiMongodb,
    docker: SiDocker,
    postman: SiPostman,
    linux: SiLinux,
  }
  const Icon = skillIcons[name]
  return Icon ? <Icon className={`tech-icon tech-icon-${name}`} aria-hidden="true" data-skill-icon={name} /> : null
}

export default App
