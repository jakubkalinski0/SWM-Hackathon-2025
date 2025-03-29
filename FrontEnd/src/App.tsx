import { useState } from 'react'
import '@/styles/App.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='flex items-center justify-center m-3'>
      <div className="card">
        <Button className='mb-3' onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <Card className="read-the-docs dark:p-3 p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ease">
          Click on the Vite and React logos to learn more
        </Card>
      </div>
      

      
    </div>
  )
}

export default App
