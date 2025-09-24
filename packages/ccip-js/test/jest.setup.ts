import { afterAll } from '@jest/globals'
// Ensure no lingering timers/sockets keep the process open
afterAll(async () => {
  // Allow any pending microtasks to settle
  await new Promise((resolve) => setTimeout(resolve, 0))
})
