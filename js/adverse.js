$(function () {
  $('#adverse_form').on('submit', function (e) {
    e.preventDefault()
    let filled_idx = 0
    let ad_data = $('#adverse_form').serialize()
    ad_data_arr = ad_data.split('&')
    let ad_data_ob = {}
    $.each(ad_data_arr, function (idx, itm) {
      let team = itm.split('=')
      ad_data_ob[team[0]] = decodeURI(team[1])
      if (team[1] !== '') filled_idx++
    })
    if (filled_idx < 1) {
      return alert('至少填写一项')
    }

    $.post({
      url: 'http://43.140.194.248/api/vaccine/adverse',
      data: JSON.stringify(ad_data_ob),
      success: function (res) {
        getDataFromADR()
        getSearchRes()
        $('#adverse_form')[0].reset()
        // refresh
      },
    })
  })
  $('#adverse_form').on('focus', () => {
    $('#adverse_form').on('keyup', (e) => {
      if (e.keyCode === 13) {
        $('#ad_submit').click()
      }
    })
  })

  // 不良反应表单提交

  // result.html 复用
  const base_num = 3

  let resArr = []
  let flag = 0 // 控制加载全部数据的标志变量
  let start_num = 0
  let end_num = start_num + base_num
  let index_num = 1
  let aid = false
  $('#res_info')[0].className = ''
  let kw

  getDataFromADR(kw)
  function getDataFromADR(kw) {
    flag = 0
    $.ajax({
      type: 'GET',
      url: 'http://43.140.194.248/api/vaccine/adverse',

      success: function (res) {
        flag++
        resArr.push(...res)
      },
    })
  }

  if ($('#res_info').html() === '') {
    $('#res_info').addClass('loading')
  }
  // loading过渡

  getSearchRes() // 默认进入加载全部数据
  function getSearchRes() {
    let timer = setInterval(function () {
      if (flag) {
        clearInterval(timer)
        showData(resArr.reverse(), start_num, end_num)
      }
    }, 10)
  }

  // search功能开始

  $('#ru_search_btn').on('click', () => {
    let text = $('#ru_search_ipt').val().trim()
    if (text === '') return alert('未输入关键字')
    $('#ru_search_ipt').val('')
    sortByKw(text, resArr)
  })

  $('#ru_search_ipt').on('focus', () => {
    $('#ru_search_ipt').on('keyup', (e) => {
      if (e.keyCode === 13) {
        $('#ru_search_btn').click()
      }
    })
  })
  // search功能结束

  // search

  function sortByKw(kw, arr) {
    let timer = setInterval(function () {
      if (flag) {
        clearInterval(timer)
        arr_dc = JSON.parse(JSON.stringify(arr))
        let sorted_arr = []
        let regExp = new RegExp('' + kw + '')
        $.each(arr_dc, (idx, itm) => {
          $.each(itm, (k, val) => {
            if (regExp.test(val)) {
              if (isNaN(val)) {
                let dval = itm[k].replace(kw, `<b style="color:red">${kw}</b>`)
                itm[k] = dval
              } else {
                let dval = itm[k]
                  .toString()
                  .replace(kw, `<b style="color:red">${kw}</b>`)
                itm[k] = dval
              }

              sorted_arr.push(itm)
            }
          })
        })
        if (!sorted_arr.length) {
          $('#res_info').html('')
          return $('#res_info').addClass('notfound')
        }
        showData(sorted_arr, start_num, end_num)
      }
    })
  }

  // search

  function showData(Arr, start_num, end_num) {
    $('#res_info').html('').removeClass('notfound')

    let timer = setInterval(function () {
      if (flag) {
        clearInterval(timer)
        let data = [Arr.slice(start_num, end_num), index_num, aid]
        let tpl = template('tpl-res', data)
        $('#res_info').removeClass('loading')
        $('#res_info').html(tpl)

        const previous = $('#pagination>li')[0]
        const next = $('#pagination>li')[$('#pagination>li').length - 1]
        const lis = $('#pagination>li').slice(1, $('#pagination>li').length - 1)
        const gobtn = $('#gobtn')[0]

        if ($(previous).next().children().html() == 1) {
          $(previous).addClass('disabled')
        } // 左边界禁用

        previous.onclick = () => {
          index_num--
          end_num = start_num
          start_num = end_num - base_num
          showData(Arr, start_num, end_num)
        }
        next.onclick = () => {
          index_num++
          start_num = end_num
          end_num = start_num + base_num
          showData(Arr, start_num, end_num)
        }
        // 左右按键切换页面

        gobtn.onclick = () => {
          let page = +$('#numgo').val().trim()
          start_num = (page - 1) * base_num
          end_num = start_num + base_num
          aid = true
          index_num = page - 2
          showData(Arr, start_num, end_num)
        }

        $('#numgo').on('focus', () => {
          $('#numgo').on('keyup', (e) => {
            if (e.keyCode === 13) {
              gobtn.click()
            }
          })
        })
        // enter hotkey
        // 快速跳转

        $.each(lis, (index, item) => {
          $(item).on('click', () => {
            // $(item).siblings().removeClass('active')
            // $(item).addClass('active')

            if (
              $(item).children().html() == 1 ||
              $(item).children().html() == 2
            ) {
              index_num = +$(item).children().html()
              start_num = (index_num - 1) * base_num
              end_num = start_num + base_num
              aid = false
            } else {
              index_num = +$(item).children().html() - 2
              start_num = (index_num + 2 - 1) * base_num
              end_num = start_num + base_num
              aid = true
            }
            showData(Arr, start_num, end_num)
          })
        })
      }
    }, 10)
  }
  // 渲染数据

  // sort 部分开始

  // $('#btn_sort_by_ID').on('click', () => {
  //   let id_str = $('#ipt_sort_by_ID').val().trim()
  //   if (id_str === '') return alert('ID输入不能为空!')
  //   sortByVal('id', id_str, resArr)
  // })
  // $('#btn_sort_by_productName').on('click', () => {
  //   let pn_str = $('#ipt_sort_by_productName').val().trim()
  //   if (pn_str === '') return alert('productName输入不能为空!')
  //   sortByVal('productName', pn_str, resArr)
  // })
  // $('#ipt_sort_by_ID').on('focus', () => {
  //   $('#ipt_sort_by_ID').on('keyup', (e) => {
  //     if (e.keyCode === 13) {
  //       $('#btn_sort_by_ID').click()
  //     }
  //   })
  // })
  // $('#ipt_sort_by_productName').on('focus', () => {
  //   $('#ipt_sort_by_productName').on('keyup', (e) => {
  //     if (e.keyCode === 13) {
  //       $('#btn_sort_by_productName').click()
  //     }
  //   })
  // })
  // // enter hotkey
  // function sortByVal(key, value, arr) {
  //   arr_dc = JSON.parse(JSON.stringify(arr))
  //   let sorted_arr = []
  //   let regExp = new RegExp('' + value + '')
  //   $.each(arr_dc, (idx, itm) => {
  //     $.each(itm, (k, val) => {
  //       if (k === key) {
  //         if (regExp.test(val)) {
  //           if (isNaN(val)) {
  //             let dval = itm[k].replace(
  //               value,
  //               `<b style="color:red">${value}</b>`,
  //             )
  //             itm[k] = dval
  //           } else {
  //             let dval = itm[k]
  //               .toString()
  //               .replace(value, `<b style="color:red">${value}</b>`)
  //             itm[k] = dval
  //           }

  //           sorted_arr.push(itm)
  //         }
  //       }
  //     })
  //   })
  //   if (sorted_arr.length === 0) return
  //   showData(sorted_arr, start_num, end_num)
  // }
  // sort 部分结束
})
