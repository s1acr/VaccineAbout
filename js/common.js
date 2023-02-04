$(function () {
  $('#sub_search_ipt').on('focus', () => {
    $('#sub_search_btn').on('click', () => {
      let kw = encodeURI($('#sub_search_ipt').val().trim())
      let resUrl = `./result.html?kw=${kw}&way=ALL`
      $('#sub_search_ipt').stop().val('')
      console.log(location.pathname)
      // if (location.pathname === `/result.html`) {
      //   alert(resUrl)
      //   window.open(resUrl, '_self')
      // } else {
      //   window.open(resUrl, '_blank')
      // }
      window.open(resUrl, '_blank')
    })
  })
})
