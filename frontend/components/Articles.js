import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import PT from 'prop-types'


export default function Articles(props) {
  // ✨ where are my props? Destructure them here
     const {articles, getArticles, deleteArticle, setCurrentArticleId } = props;

  // ✨ implement conditional logic: if no token exists
  // we should render a Navigate to login screen (React Router v.6)
        if(!localStorage.getItem('token')) {
             return <Navigate to="/login" />
        }

  useEffect(() => {
    // ✨ grab the articles here, on first render only
  //  console.log("hello, articles")
    getArticles();
  }, []);

  

  return (
    // ✨ fix the JSX: replace `Function.prototype` with actual functions
    // and use the articles prop to generate articles
    <div className="articles">
      <h2>Articles</h2>
      {
         articles && articles.length === 0
          ? 'No articles yet'
          : articles.map(art => (
              <div className="article" key={art.article_id}>
                <div>
                  <h3>{art.title}</h3>
                  <p>{art.text}</p>
                  <p>Topic: {art.topic}</p>
                </div>
                <div>
                  <button onClick={() => setCurrentArticleId(art.article_id)}>Edit</button> 
                  <button onClick={() => deleteArticle(art.article_id)}>Delete</button>
                </div>
              </div>
            ))
          }
      
    </div>
  )
}

// 🔥 No touchy: Articles expects the following props exactly:
Articles.propTypes = {
  articles: PT.arrayOf(PT.shape({ // the array can be empty
    article_id: PT.number.isRequired,
    title: PT.string.isRequired,
    text: PT.string.isRequired,
    topic: PT.string.isRequired,
  })).isRequired,
  getArticles: PT.func.isRequired,
  deleteArticle: PT.func.isRequired,
  setCurrentArticleId: PT.func.isRequired,
  currentArticleId: PT.number, // can be undefined or null
}
