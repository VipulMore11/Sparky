'use client'

import pb from '@/lib/pb';
import React, { useEffect } from 'react'

const page = () => {

  useEffect(() => {
    async function getData() {
      try {
        const records = await pb.collection('projects').getFullList()
      } catch (error) {
        console.error('Error fetching organization data:', error)
      }
    } getData()
  }, [])
  return (
    <div>

    </div>
  )
}

export default page
