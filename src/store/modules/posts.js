import axios from 'axios'
import { Notification } from 'element-ui'

const state = {
  dbName: 'wp',
  postsLength: 10,
  posts: [
    {
      post_id: '0',
      post_title: '标题加载中...',
      post_content: '内容加载中...',
      is_loading: false
    }
  ],
  msgObjUnknown: {
    title: '未知错误',
    message: '这是一条未知错误'
  }
}

const getters = {
  getPosts: state => state.posts
}

// state取出axios所要传递参数
const actions = {
  fetchPosts ({commit, state}) {
    axios({
      method: 'post',
      url: 'http://spider-show.mazey.cn/interface/post.php',
      data: {
        name: state.dbName
      },
      transformRequest: [function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      }]
    })
      .then(function (res) {
        // console.log(res.data)
        commit('updatePosts', res.data)
        Notification.success({
          title: '加载成功',
          message: '数据库 ' + state.dbName + ' 读取成功！'
        })
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  submitPost ({commit, dispatch, state}, obj) {
    commit('btnLoading', obj.index)
    let postTitle = document.getElementById('title-' + obj.postId).innerHTML
    axios({
      method: 'post',
      url: 'http://spider-show.mazey.cn/interface/submit.php',
      data: {
        post_id: obj.postId,
        post_title: postTitle,
        post_content: document.getElementById('content-' + obj.postId).innerHTML,
        act: obj.act,
        name: state.dbName
      },
      transformRequest: [function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      }]
    })
      .then(function (response) {
        console.log(response.data)
        let ret = response.data.ret
        let code = response.data.code
        // console.log(code, typeof code)
        let msgObj = {
          title: ret,
          message: postTitle
        }
        if (typeof code === 'undefined') {
          Notification.warning(msgObj)
        } else if (parseInt(code, 10) === 0) {
          Notification.success(msgObj)
        } else {
          Notification.error(state.msgObjUnknown)
        }
      })
      .catch(function (error) {
        console.log(error)
      })
    commit('splicePosts', obj.index)
    window.scrollTo(0, 0)
    if (state.posts.length === 0) {
      Notification.info({
        title: '加载中...',
        message: '数据库 ' + state.dbName + ' 文章读取中...<br />' + (function () {
          let d = new Date()
          let h = d.getHours()
          let m = d.getMinutes()
          let s = d.getSeconds()
          return `${h}:${m}:${s}`
        })(),
        dangerouslyUseHTMLString: true
      })
      dispatch('fetchPosts')
    }
  }
}

const mutations = {
  updateDbName (state, dbName) {
    state.dbName = dbName
  },
  updatePosts (state, posts) {
    state.posts = (function (posts) {
      let arr = []
      for (let {
        post_id,
        post_title,
        post_content
      } of posts) {
        arr.push({
          post_id,
          post_title,
          post_content,
          is_loading: false
        })
      }
      // console.log(arr)
      return arr
    })(posts)
  },
  splicePosts (state, index) {
    state.posts.splice(index, 1)
  },
  btnLoading (state, index) {
    state.posts[index].is_loading = true
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
