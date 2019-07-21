import styled from 'styled-components'

export const Wrapper = styled.div`
 .btn-align{
  margin-left: auto;
  :nth-child(1){
    margin-top: 10px;
  }
 }
 
 .reference{
    width: 500px;
 }
 .error{
  color: red; 
 }
`


export const Step = styled.p`
  margin-top: 20px;
  margin-right: ${props => props.index < 9 ? '10px': null};
  font-size: 16px;
  font-weight: bold;
`

export const TotalTime = styled.div`
  margin-left: auto;
  div{
    height: 40px;
    width:  200px;
    border: 1px solid black;
  }
  
`







