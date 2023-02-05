/*
 * @Author: slacr 2845391871@qq.com
 * @Date: 2023-02-02 19:40:48
 * @LastEditors: slacr 2845391871@qq.com
 * @LastEditTime: 2023-02-05 08:18:34
 * @FilePath: \VaccineAbout\js\result.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
$(function () {
  const qs = location.search
  const base_num = 5
  if (qs) {
    getSearchRes()
    qstr = qs.substring(1).split('&')
    var kw = decodeURI(qstr[0].split('=')[1])
    var way = decodeURI(qstr[1].split('=')[1])
    switch (way) {
      case 'ALL':
        getDataFromCFDA(kw)
        getDataFromFDACN(kw)
        break
      case 'CFDA':
        getDataFromCFDA(kw)

        break
      case 'FDACN':
        getDataFromFDACN(kw)
        break
      default:
        alert('error')
    }
  }

  let resArr = []
  let flag = 0 // 控制加载全部数据的标志变量
  let start_num = 0
  let end_num = start_num + base_num
  let index_num = 1
  let aid = false
  $('#res_info')[0].className = ''

  function getDataFromCFDA(kw) {
    $.ajax({
      type: 'GET',
      url: 'http://43.140.194.248/api/vaccine/cfda',

      success: function (res) {
        flag++
        resArr.push(...res)
      },
    })
  }

  function getDataFromFDACN(kw) {
    $.ajax({
      type: 'GET',
      url: 'http://43.140.194.248/api/vaccine/fda/cn',

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

  // 直接进入此页默认界面
  if (!kw) {
    getDataFromCFDA(kw)
    getDataFromFDACN(kw)
    let timer = setInterval(function () {
      if (flag === 2) {
        clearInterval(timer)
        showData(resArr, start_num, end_num)
      }
    }, 20)
  }

  // search Url传参查找开始

  function sortByKw(kw, arr) {
    let timer = setInterval(function () {
      if ((way == 'ALL' && flag === 2) || (way !== 'ALL' && flag)) {
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
          return $('#res_info').addClass('notfound')
        }
        showData(sorted_arr, start_num, end_num)
      }
    }, 10)
  }

  function getSearchRes() {
    let timer = setInterval(function () {
      if ((way == 'ALL' && flag === 2) || (way !== 'ALL' && flag)) {
        clearInterval(timer)
        sortByKw(kw, resArr)
      }
    }, 10)
  }

  // search Url传参查找结束

  function showData(Arr, start_num, end_num) {
    $('#res_info').removeClass('notfound')
    $('#res_info').html('')
    let timer = setInterval(function () {
      if ((way == 'ALL' && flag === 2) || (way !== 'ALL' && flag)) {
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

  $('#btn_sort_by_ID').on('click', () => {
    let id_str = $('#ipt_sort_by_ID').val().trim()
    if (id_str === '') return alert('ID输入不能为空!')
    sortByVal('id', id_str, resArr)
  })
  $('#btn_sort_by_productName').on('click', () => {
    let pn_str = $('#ipt_sort_by_productName').val().trim()
    if (pn_str === '') return alert('productName输入不能为空!')
    sortByVal('productName', pn_str, resArr)
  })
  $('#ipt_sort_by_ID').on('focus', () => {
    $('#ipt_sort_by_ID').on('keyup', (e) => {
      if (e.keyCode === 13) {
        $('#btn_sort_by_ID').click()
      }
    })
  })
  $('#ipt_sort_by_productName').on('focus', () => {
    $('#ipt_sort_by_productName').on('keyup', (e) => {
      if (e.keyCode === 13) {
        $('#btn_sort_by_productName').click()
      }
    })
  })
  // enter hotkey
  function sortByVal(key, value, arr) {
    arr_dc = JSON.parse(JSON.stringify(arr))
    let sorted_arr = []
    let regExp = new RegExp('' + value + '')
    $.each(arr_dc, (idx, itm) => {
      $.each(itm, (k, val) => {
        if (k === key) {
          if (regExp.test(val)) {
            if (isNaN(val)) {
              let dval = itm[k].replace(
                value,
                `<b style="color:red">${value}</b>`,
              )
              itm[k] = dval
            } else {
              let dval = itm[k]
                .toString()
                .replace(value, `<b style="color:red">${value}</b>`)
              itm[k] = dval
            }

            sorted_arr.push(itm)
          }
        }
      })
    })
    if (sorted_arr.length === 0)
      return $('#res_info').html('').addClass('notfound')
    showData(sorted_arr, start_num, end_num)
  }
  // sort 部分结束
})
