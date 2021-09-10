/** @jsx jsx */
import { jsx } from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
  FaUserMinus,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import { useQuery, useMutation, queryCache } from 'react-query'
import { client } from 'utils/api-client'
import { useAsync } from 'utils/hooks'
import * as colors from 'styles/colors'
import { CircleButton, Spinner } from './lib'

function TooltipButton({ label, highlight, onClick, icon, ...rest }) {
  const { isLoading, isError, error, run } = useAsync()

  function handleClick() {
    run(onClick())
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
                ? colors.danger
                : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({ user, book }) {

  const { data: listItems } = useQuery({
    queryKey: 'list-items',
    queryFn: () => client('list-items', { token: user.token }).then(data => data.listItems)
  })

  const listItem = listItems?.find(li => li.bookId === book.id) ?? null

  const [remove] = useMutation(
    ({ id }) => client(`list-items/${id}`, { method: 'DELETE', token: user.token }),
    { onSettled: () => queryCache.invalidateQueries('list-items') },
  )

  const [create] = useMutation(
    ({ bookId }) => client('list-items', { data: { bookId }, token: user.token }),
    { onSettled: () => queryCache.invalidateQueries('list-items') },
  )

  const [update] = useMutation(
    (updates) => client(`list-items/${updates.id}`, { data: updates, token: user.token, method: 'PUT' }),
    { onSettled: () => queryCache.invalidateQueries('list-items') }
  )
  // 💰 for all the mutations below, if you want to get the list-items cache
  // updated after this query finishes the use the `onSettled` config option
  // to queryCache.invalidateQueries('list-items')

  // 🐨 call useMutation here and assign the mutate function to "update"
  // the mutate function should call the list-items/:listItemId endpoint with a PUT
  //   and the updates as data. The mutate function will be called with the updates
  //   you can pass as data.


  return (
    <>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            label="Unmark as read"
            highlight={colors.yellow}
            // 🐨 add an onClick here that calls update with the data we want to update
            // 💰 to mark a list item as unread, set the finishDate to null
            // {id: listItem.id, finishDate: null}
            onClick={() => update({ id: listItem.id, finishDate: null })}
            icon={<FaBook />}
          />
        ) : (
          <TooltipButton
            label="Mark as read"
            highlight={colors.green}
            // 🐨 add an onClick here that calls update with the data we want to update
            // 💰 to mark a list item as read, set the finishDate
            // {id: listItem.id, finishDate: Date.now()}
            onClick={() => update({ id: listItem.id, finishDate: Date.now() })}
            icon={<FaCheckCircle />}
          />
        )
      ) : null}

      {listItem ? (
        <TooltipButton
          label="Remove from list"
          highlight={colors.danger}
          onClick={() => remove({ id: listItem.id })}
          icon={<FaMinusCircle />}
        />
      ) : (
        <TooltipButton
          label="Add to list"
          highlight={colors.indigo}
          onClick={() => create({ bookId: book.id })}
          icon={<FaPlusCircle />}
        />
      )}

    </>
  )
}

export { StatusButtons }
