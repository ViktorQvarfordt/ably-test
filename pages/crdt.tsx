import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const View = dynamic<any>(
  () => import('../client/crdt')
    .then((mod) => mod.View)
    .catch(err => {
      console.error(err)
      return function Error () {
        return <p>Component failed to load: {err.message}</p>
      }
    }),
  { ssr: false })

const Page: NextPage = () => {
  return <View />
}

export default Page
