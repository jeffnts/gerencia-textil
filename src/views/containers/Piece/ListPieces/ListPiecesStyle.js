import styled from 'styled-components'

export const Wrapper = styled.div`

`

export const Pieces = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const Piece = styled.div`
  width: 400px;
  opacity: 0.6;
  text-align: center;
  :hover{
    opacity: 1;
    transition: 0.5s;
  }
  a{
    text-decoration: none;
    color: black;
  }
  img{
    max-width: 350px;
    max-height: 350px;
  }
`
