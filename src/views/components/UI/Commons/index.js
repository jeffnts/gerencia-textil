import styled from 'styled-components'

export const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
`

export const Line = styled.div`
  width: 600px;
  height: 2px;
  background-color: black;
`

export const Container = styled.div`
  margin: 20px auto 20px auto;
  max-width: 1580px;
`

export const Content = styled.div`
  margin: 20px 0 20px 0;  
`


export const Box = styled.div`
  padding: 10px;
  margin-bottom: 20px;
  border-top: 5px #5063b1 solid;
  color: ${props => props.title ? 'white': 'black'}
  background-color: ${props => props.title ? '#5063b1': '#ffffff'}; 
  box-shadow: 10px 10px 57px -20px rgba(0,0,0,0.75);
`

export const Row = styled.div`
  display: flex;
  align-items: center;
`

export const FormItem = styled.div`
  margin: ${props => props.error === true? '35px 20px 10px 0px': '10px 20px 10px 0px'};
  //color: ${props => props.error === true? 'red': null};
  .error{
    //border: ${props => props.error === true? '1px solid red': null};      
  }
  .error input::placeholder {
    //color: ${props => props.error === true? 'red': null};
  }
`

export const Buttons = styled.div`
  margin-top: 25px;
  margin-left: auto;  
`

export const Filters = styled.div`
  margin: 20px 0 20px 0;
  padding: 10px;
  background-color: #f3f3f3;  
  border-left: 10px solid #5063b1;
`


