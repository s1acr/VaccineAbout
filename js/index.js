/*
 * @Author: slacr 2845391871@qq.com
 * @Date: 2023-02-01 04:18:15
 * @LastEditors: slacr 2845391871@qq.com
 * @LastEditTime: 2023-02-03 21:33:55
 * @FilePath: \VaccineAbout\js\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
$(function () {
  const search_ipt = $('#search_input')
  const search_btn = $('#search_btn')
  $('#search_input').on('focus blur', () =>
    $('.searchblock').toggleClass('bgfilter'),
  )
  // 输入框选中背景添加filter

  $('#search_input').on('focus', () => {
    $('#search_input').on('keyup', (e) => {
      if (e.keyCode === 13) {
        search_btn.click()
      }
    })
  })
  // enter hotkey

  const searchtabs = $('.searchtab ul li')
  searchtabs.each((index, item) => {
    $(item).on('click', (e) => {
      $(e.target).parent().siblings().removeClass('d-active')
      $(e.target).parent().addClass('d-active')
    })
  })
  // searchtab 选择

  search_btn.on('click', () => {
    let index
    $.each(searchtabs, function (i, value) {
      if (value.classList.contains('d-active')) return (index = i)
    })
    let way = encodeURI(searchtabs[index].getAttribute('data-way'))
    let kw = encodeURI(search_ipt.val().trim())
    let resUrl = `./result.html?kw=${kw}&way=${way}`
    search_ipt.stop().val('')
    window.open(resUrl, '_blank')
  })
  // search 跳转
})
