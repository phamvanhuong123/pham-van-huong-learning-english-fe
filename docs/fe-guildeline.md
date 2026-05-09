# Front-end Guideline
## Objectives
- Code easy to read, maintain, scale
- Reduce bugs (side effects)
- Optimize performance & UX
## Clean Code Rules
### Naming Convention
- Variable: noun, meaningful → `userList`, `isLoading`
- Function: verb + noun → `fetchUsers`, `handleSubmit`
- Boolean: is/has/can → `isValid`, `hasError`
- Constant: UPPER_CASE → `API_URL`
Example:
```js
const userList = []
```
### Function Rules
- 1 function = 1 responsibility
- Max ~20–30 lines
- Avoid nesting >3 levels
```js
const handleSubmit = async () => {
  if (!isValidForm()) return
  await createUser()
}
const isValidForm = () => form && form.email && validate(form)
const createUser = async () => {
  const res = await userService.create(form)
  handleSuccess(res)
}
```
## Component Architecture
Separate: hook (logic), service (API), UI component
### Service
```ts
export const getUsers = () => axios.get('/users')
```
### Hook
```ts
export const useUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => { fetchUsers() }, [])
  const fetchUsers = async () => {
    setLoading(true)
    const res = await getUsers()
    setUsers(res.data)
    setLoading(false)
  }
  return { users, loading }
}
```
### UI
```js
const UserList = ({ users }) => {
  return users.map(user => <UserItem key={user.id} />)
}
```
## State Management
Problem (duplicated state):
```js
const [fullName, setFullName] = useState('')
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
```
Correct:
```js
const fullName = `${firstName} ${lastName}`
```
Rule:
- Do not store computable state
- Do not manually sync state
## API Handling
Objective:
- Separate UI & data
- Easy to change backend
Flow:
```
Component → Hook → Service → API
```
### Axios instance
```ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000
})
```
### Interceptor
```ts
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // refresh token or logout
    }
    return Promise.reject(err)
  }
)
```
### Service
```ts
export const userService = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data)
}
```
### Hook
```ts
export const useUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getUsers()
      setUsers(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return { users, loading, error, fetchUsers }
}
```
### Component
```js
const UserPage = () => {
  const { users, loading, error, fetchUsers } = useUsers()
  useEffect(() => { fetchUsers() }, [])
  if (loading) return <Spinner />
  if (error) return <Error message={error} />
  return <UserList users={users} />
}
```
Best practices:
- Handle: loading, success, error, empty
- Do NOT call API directly in component
- Optional: React Query / SWR, caching, retry
## Performance
### Re-render problem
```js
<Child onClick={() => console.log('click')} />
```
Fix:
```js
const handleClick = useCallback(() => {
  console.log('click')
}, [])
```
### Memoization
```js
const total = useMemo(() => items.reduce(...), [items])
```
### Code Splitting
```js
const UserPage = React.lazy(() => import('./UserPage'))
```
### List Optimization
```js
users.map(u => <Item key={u.id} />)
```
### Advanced
- Virtual list: react-window, react-virtualized
- Debounce input
- Avoid unnecessary state
### Checklist
- Unnecessary re-render?
- Correct key?
- Lazy loading?
- Heavy computation optimized?
## Folder Structure
### Bad
```
src/
  components/
  utils/
  pages/
```
### Best (feature-based)
```
src/modules/user/{components,hooks,services,types,pages}
```
### Shared
```
src/shared/{components,hooks,utils,constants}
```
### Why
- Scalable
- Maintainable
- Reusable