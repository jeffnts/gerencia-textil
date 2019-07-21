import styled from 'styled-components'

export const Wrapper = styled.div`
  .btn-align{    
    margin: 10px 0  10px auto;
  }
`

export const ReportList = styled.div`
`

export const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 10px #5063b1 solid;
`

export const ReportTitle = styled.div`  
  padding: 10px;
  font-size: 20px;
  font-weight: bold;
`

export const ReportRow = styled.div`
  //display: flex;
  //justify-content: space-between;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 5px #5063b1 solid;
`

export const ReportItem = styled.div`
  display: flex;
  flex-direction: ${props => props.column? 'column': 'row'};
  justify-content: center;
  align-items: center;  
  padding: 10px;
`

export const ReportTableHeader = styled.div`
  
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.center ? 'center' : 'space-between'};
  background-color: ${props => props.piece ? '#f0f0f0' : '#d4d4d4'};
`

export const ReportTableTitle = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 4fr 4fr;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;  
`
export const ReportTableRow = styled.div`
  margin-bottom: 10px;
  padding: ${props => props.result ? '10px' : null};
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 4fr 4fr;
  background-color: ${props => props.result ? '#d4d4d4' : null};

`
