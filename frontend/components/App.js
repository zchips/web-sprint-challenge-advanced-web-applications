import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {

  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      navigate("/");
      return null; // Render nothing while redirecting
    }
  
    return children; // Render the protected component
  };

  const redirectToLogin = () => { 
    navigate("/");
  }
  const redirectToArticles = () => { 
    navigate("/articles");
  }

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  }
    
  const login = ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
    console.log(username, password);
    axios.post(loginUrl, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.message);
        redirectToArticles();
      })
      .catch(err => {
        console.error(err);
        setMessage(err.response.data.message);
        redirectToLogin();
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  }
  
  // Helper to attach the token in the Authorization header
  const getAuthConfig = () => ({
    headers: { Authorization: localStorage.getItem('token') }
  });

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);
    axios.get(articlesUrl, getAuthConfig())
      .then(res => {
        setArticles(res.data.articles);
        setMessage(res.data.message);
      })
      .catch(err => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          redirectToLogin();
        } else {
          setMessage('');
        }
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  }

  const postArticle = article => {
    setMessage('');
    setSpinnerOn(true);
    axios.post(articlesUrl, article, getAuthConfig())
      .then(res => {
        console.log(res);
        setArticles(articles => articles.concat(res.data.article));
        setMessage(res.data.message);
      })
      .catch(err => {
        console.error(err);
        setMessage(err.response.data.message);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  }

  const updateArticle = ({ article_id, article }) => {
    const updateUrl = `${articlesUrl}/${article_id}`;
    setMessage('');
    setSpinnerOn(true);
    console.log(`Sending PUT request to: ${updateUrl}`, article);
    axios.put(updateUrl, article, getAuthConfig())
      .then(res => {
        console.log('Update response:', res);
        setArticles(articles => articles.map(art => 
          art.article_id === article_id ? res.data.article : art
        ));
        setMessage(res.data.message);
      })
      .catch(err => {
        console.error(err);
        setMessage(err.response.data.message);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  }

  const deleteArticle = article_id => {
    setMessage('');
    setSpinnerOn(true);
    axios.delete(`${articlesUrl}/${article_id}`, getAuthConfig())
      .then((res) => {
        setArticles(articles.filter(a => a.article_id !== article_id));
        setMessage(res.data.message);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  }

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} id="message"/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            token ? (
              <>
                <ArticleForm 
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  currentArticle={articles.find(article => article.article_id === currentArticleId)}
                  setCurrentArticleId={setCurrentArticleId}
                />
                <Articles 
                  articles={articles} 
                  getArticles={getArticles} 
                  deleteArticle={deleteArticle} 
                  setCurrentArticleId={setCurrentArticleId} 
                />
              </>
            ) : (
              <Navigate replace to="/" />
            )
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
