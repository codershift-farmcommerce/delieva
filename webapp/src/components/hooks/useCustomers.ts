import { useState, useEffect } from 'react'
import { Customer } from 'interface/entities/customer'
import { CustomerClient }from 'webapp/src//api/clients/customer'

const customerClient = new CustomerClient()

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerClient.list({ query: '', page: 1 })
        setCustomers(response.customers)
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  return { customers, isLoading }
}
