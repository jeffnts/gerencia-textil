import styled from 'styled-components'

export const Content = styled.div`
  display: flex;
  flex-direction: column;  
  margin: 10px;
  padding: 0;
  border: 1px black solid;
  @media print{
    flex-wrap: wrap !important;
    break-inside: avoid;
    page-break-inside: avoid;
  } 
`

export const Line = styled.div`  
  height: 0.5px;
  border: 0.5px black solid;
`

export const Header = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`
export const Row = styled.div`
  height: 22px;
  display: flex;
  flex-direction: row;
  font-size: 10px;      
`


export const Box = styled.div`
  width: ${props => props.size && props.size+'%'};
  padding: 5px;
  border-right-color: black;
  border-right-style: solid;
  border-right-width: ${props => props.final? '0px': '1px'};
  display: flex;    
`

export const Text = styled.p`
  font-weight: ${props => props.bold? 'bold': null};
`

export const Button = styled.div`
  margin: 10px;
  button{
    @media print{
      display: none;      
    }
  }
`
