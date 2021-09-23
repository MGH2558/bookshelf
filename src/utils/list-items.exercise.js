import { useQuery, useMutation, queryCache } from 'react-query'
import { client } from './api-client'
import { setQueryDataForBook } from './books.exercise'

const defaultMutationOptions = {
  onError(err, variables, recover) {
    if (typeof recover === 'function') {
      console.log('Error on mutation: ', err)
      recover()
    }
  },
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useListItems(user) {
  const { data: listItems } = useQuery({
    queryKey: 'list-items',
    queryFn: () => client('list-items', { token: user.token }).then(data => data.listItems),
    config: {
      onSuccess(listItems) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      }
    }
  })

  return listItems ?? []
}

function useListItem(user, bookId) {
  const listItems = useListItems(user)
  return listItems.find(li => li.bookId === bookId) ?? null
}

function useUpdateListItem(user, options) {
  return useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
        token: user.token,
      }),
    {
      onMutate(newItem) {
        const previousItems = queryCache.getQueryData('list-items')
        
        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === newItem.id ? { ...item, ...newItem } : item
          })
        })
        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions, ...options
    },
  )
}

function useRemoveListItem(user, options) {
  return useMutation(
    ({ id }) => client(`list-items/${id}`, { method: 'DELETE', token: user.token }),
    {
      onMutate(removedItem) {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.filter(item => item.id !== removedItem.id)
        })
        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions, ...options
    },
  )
}

function useCreateListItem(user, options) {
  return useMutation(
    ({ bookId }) => {
      client('list-items', { data: { bookId }, token: user.token })
    },
    { ...defaultMutationOptions, ...options },
  )
}

export { useListItems, useListItem, useUpdateListItem, useRemoveListItem, useCreateListItem }