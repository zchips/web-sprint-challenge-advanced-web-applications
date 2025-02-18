import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/')
  const redirectToArticles = () => navigate('/articles')

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  }

  const login = async ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        console.log('Token set in localStorage:', data.token);
        setMessage(data.message);
        setTimeout(() => redirectToArticles(), 100); // Short delay to ensure token is stored
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Failed to connect to the server');
    }
    setSpinnerOn(false);
  }

  const getArticles = async () => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token being used for fetch:', token);
      if (!token) {
        setMessage('Unauthorized. Please log in again.');
        redirectToLogin();
        return;
      }
      const response = await fetch(articlesUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setArticles(data);
        setMessage('Articles fetched successfully');
      } else if (response.status === 401) {
        redirectToLogin();
      }
    } catch (error) {
      setMessage('Failed to connect to the server');
    }
    setSpinnerOn(false);
  }

  const postArticle = async article => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(articlesUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });
      const data = await response.json();
      if (response.ok) {
        setArticles(prev => [...prev, data]);
        setMessage('Article posted successfully');
      }
    } catch (error) {
      setMessage('Failed to post article');
    }
    setSpinnerOn(false);
  }

  const updateArticle = async ({ article_id, article }) => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${articlesUrl}/${article_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });
      const data = await response.json();
      if (response.ok) {
        setArticles(prev => prev.map(a => a.id === article_id ? data : a));
        setMessage('Article updated successfully');
      }
    } catch (error) {
      setMessage('Failed to update article');
    }
    setSpinnerOn(false);
  }

  const deleteArticle = async article_id => {
    setMessage('');
    setSpinnerOn(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${articlesUrl}/${article_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setArticles(prev => prev.filter(a => a.id !== article_id));
        setMessage('Article deleted successfully');
      }
    } catch (error) {
      setMessage('Failed to delete article');
    }
    setSpinnerOn(false);
  }

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="/articles" element={
          <>
            <ArticleForm
              postArticle={postArticle}
              updateArticle={updateArticle}
              setCurrentArticleId={setCurrentArticleId}
              currentArticleId={currentArticleId}
            />
            <Articles 
              articles={articles}
              getArticles={getArticles}
              deleteArticle={deleteArticle}
              setCurrentArticleId={setCurrentArticleId}  
            />
          </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
