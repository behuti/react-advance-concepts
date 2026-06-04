import { useState, useEffect } from 'react'

/**
 * ========================================
 * PATTERN: Container / Presentational
 * ========================================
 *
 * WHAT IT IS:
 * Separate components into two categories:
 *
 * - **Container (Smart)**: Handles state, data fetching, and logic.
 *   Tells the presentational component WHAT to show.
 *
 * - **Presentational (Dumb)**: Receives props and renders UI.
 *   Has no state (or only UI state). Tells the parent HOW to show it.
 *
 * WHY IT MATTERS (Interview):
 * - Enforces separation of concerns (business logic vs rendering)
 * - Presentational components are highly reusable
 * - Containers are easier to test (pure data flow)
 * - With Hooks, this pattern is less explicit but still useful
 *
 * MODERN TAKE:
 * Hooks blur the line — you can use hooks in presentational
 * components. The essence (separate logic from rendering) still
 * applies; you just use custom hooks instead of container components.
 */

// ─── 1. PRESENTATIONAL: UserCard ─────────────────────────────────
// Pure rendering. No state, no data fetching, no business logic.

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
}

interface UserCardProps {
  user: User
  onSelect: (user: User) => void
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <article className="user-card" onClick={() => onSelect(user)}>
      <img
        src={user.avatarUrl}
        alt={`Avatar of ${user.name}`}
        className="user-card__avatar"
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
      />
      <div className="user-card__info">
        <h3 className="user-card__name">{user.name}</h3>
        <p className="user-card__email">{user.email}</p>
      </div>
    </article>
  )
}

interface UserListProps {
  users: User[]
  onSelect: (user: User) => void
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}

export function UserList({
  users,
  onSelect,
  loading = false,
  error = null,
  emptyMessage = 'No users found.',
}: UserListProps) {
  if (loading) return <div className="spinner">Loading users...</div>
  if (error) return <div className="error-message">{error}</div>
  if (users.length === 0) return <p>{emptyMessage}</p>

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} onSelect={onSelect} />
      ))}
    </div>
  )
}

// ─── 2. CONTAINER: UserListContainer ─────────────────────────────
// Handles data fetching, state management, and callbacks.

interface UserListContainerProps {
  onUserSelect?: (user: User) => void
  fetchUsers?: () => Promise<User[]>
}

export function UserListContainer({
  onUserSelect,
  fetchUsers,
}: UserListContainerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = fetchUsers
          ? await fetchUsers()
          : await defaultFetchUsers()
        if (!cancelled) setUsers(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [fetchUsers])

  const handleSelect = (user: User) => {
    onUserSelect?.(user)
  }

  return (
    <UserList
      users={users}
      onSelect={handleSelect}
      loading={loading}
      error={error}
    />
  )
}

async function defaultFetchUsers(): Promise<User[]> {
  // Simulate fetching users
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/80?u=1' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/80?u=2' },
    { id: '3', name: 'Carol White', email: 'carol@example.com', avatarUrl: 'https://i.pravatar.cc/80?u=3' },
  ]
}

// ─── 3. HOOK-BASED APPROACH (modern alternative) ─────────────────

function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    defaultFetchUsers()
      .then(data => { if (!cancelled) setUsers(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { users, loading, error }
}

// Usage: the same presentational UserList is used, but state comes
// from a custom hook inside the component instead of a container.

export function UserListWithHook() {
  const { users, loading, error } = useUsers()
  return (
    <UserList
      users={users}
      onSelect={user => console.log('Selected:', user)}
      loading={loading}
      error={error}
    />
  )
}

// ─── DEMO ────────────────────────────────────────────────────────

export function ContainerPresentationalDemo() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <div className="pattern-example">
      <h1>Container / Presentational</h1>

      <pre><code>{`// Presentational: renders props, no logic
function UserList({ users, onSelect, loading }) {
  if (loading) return <Spinner />
  return users.map(u => (
    <div onClick={() => onSelect(u)}>{u.name}</div>
  ))
}

// Container: manages state, passes to presentational
function UserListContainer() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetchUsers().then(setUsers) }, [])
  return <UserList users={users} onSelect={handleSelect} />
}

// Modern hook-based alternative
function useUsers() { /* ...state + fetch logic... */ }
function UserListWithHook() {
  const { users, loading } = useUsers()
  return <UserList users={users} loading={loading} />
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Container + Presentational</h2>
          <UserListContainer onUserSelect={setSelectedUser} />
          {selectedUser && (
            <p>Selected: <strong>{selectedUser.name}</strong></p>
          )}
        </div>

        <div className="demo-card">
          <h2>Hook-Based Approach</h2>
          <UserListWithHook />
          <p className="hint">
            Same presentational component, but the hook manages state.
            This is the modern approach.
          </p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>Container vs Presentational — what's the difference?</strong> Containers manage state and logic. Presentational components receive props and render markup. Containers tell what to show; presentational shows it.</li>
          <li><strong>Is this still relevant with Hooks?</strong> The distinction is less rigid but the principle endures. Instead of container components, we use custom hooks to separate logic from rendering.</li>
          <li><strong>What are the benefits?</strong> Presentational components are reusable across projects. Logic is easier to test in isolation. Components are smaller and more focused.</li>
        </ol>
      </section>
    </div>
  )
}
