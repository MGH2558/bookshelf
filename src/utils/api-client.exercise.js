function client(endpoint, customConfig = {}) {

  const config = {
    method: 'GET',
    ...customConfig
  }
  return fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, config)
    .then(
      async response => {
        console.log(response)
        const data = await response.json()
        if (response.ok) {
          return data
        } else {
          return Promise.reject(data)
        }
      })

  // const response = await fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, config)
  // const responseData = await response.json()
  // return responseData
}

export { client }

/*






























💰 spoiler alert below...



























































const config = {
    method: 'GET',
    ...customConfig,
  }
*/
