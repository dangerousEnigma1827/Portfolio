import type { ContactLink, ProjectDetailConfig, ProjectKey, SkillCategory } from '../types'

export const identity = {
  name: 'Muneeb',
  systemName: 'dangerousEnigma.sys',
  tagline: 'I love solving problems, exploring the beauty of mathematics, and constantly learning new things.',
  about: "I'm a Computer Science student at IIT (ISM) Dhanbad who enjoys mathematics, problem-solving, and exploring how things work. I like learning new technologies, and outside coding, I enjoy playing the guitar and listening to music.",
}

export const skillCategories: SkillCategory[] = [
  { label: 'Programming Languages', skills: ['C', 'C++', 'Python', 'JavaScript', 'TypeScript'] },
  { label: 'Frontend Development', skills: ['React', 'Next.js', 'Tailwind CSS'] },
  { label: 'Backend Development', skills: ['Node.js', 'Express.js', 'WebSockets'] },
  { label: 'Databases & Caching', skills: ['Redis', 'mongodb'] },
  { label: 'Tools & Platforms', skills: ['Docker', 'Postman', 'Linux'] },
]

export const projectDetails: Record<ProjectKey, ProjectDetailConfig> = {
  dairix: {
    title: 'DAIRIX',
    imageSource: undefined,
    description: 'A dairy management platform designed to streamline customer subscriptions, recurring deliveries, and delivery operations through a unified system.',
  },
  smarttrace: {
    title: 'SMARTTRACE',
    imageSource: undefined,
    description: 'A pharmaceutical anti-counterfeit and traceability platform designed to verify product authenticity and detect duplicate or tampered serializations.',
  },
}

export const projectDocumentation: Record<ProjectKey, { readme: string }> = {
  dairix: {
    readme: `Dairix is a dairy management platform for coordinating customer subscriptions, recurring deliveries, and delivery operations through one unified system.\n\nIt is intended to help customers, delivery personnel, and owners manage the recurring-delivery workflow with clearer coordination and verification.\n\nKey features and technical overview:\n\n- Role-based authentication for customers, delivery personnel, and owners.\n- QR-based customer identification and delivery verification.\n- Subscription and recurring-delivery management.\n- Redis caching and rate limiting.\n- Real-time delivery status updates using Socket.IO.\n- Docker Compose-based development environment.`,
  },
  smarttrace: {
    readme: `SmartTrace addresses the pharmaceutical authentication and traceability problem: products need a reliable way to be verified as they move through packaging and distribution.\n\nIt is a team project focused on verifying product authenticity and detecting duplicate or tampered serializations.\n\nTechnical overview:\n\n- Unique serial identifiers with check-digit validation.\n- Unit → Carton → Pallet packaging hierarchy.\n- SHA-256 fingerprint generation and comparison.\n- Duplicate and tampering detection.`,
  },
}

export const contacts: ContactLink[] = [
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/muneeb-syed-17b407377/?isSelfProfile=true', value: 'linkedin.com/in/muneeb-syed-17b407377' },
  { key: 'github', label: 'GitHub', href: 'https://github.com/dangerousEnigma1827', value: 'github.com/dangerousEnigma1827' },
  { key: 'codeforces', label: 'Codeforces', href: 'https://codeforces.com/profile/dangerousEnigma', value: 'codeforces.com/profile/dangerousEnigma' },
  { key: 'email', label: 'Email', href: 'mailto:syedmuneebmalik1827@gmail.com', value: 'syedmuneebmalik1827@gmail.com' },
]

export const resumeConfig = {
  label: 'Download Resume',
  href: undefined as string | undefined,
}
