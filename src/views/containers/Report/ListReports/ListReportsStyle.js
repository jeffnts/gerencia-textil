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
  display: flex;
  justify-content: space-between;
  border-bottom: 5px #5063b1 solid;
`

export const ReportItem = styled.div`
  display: flex;
  flex-direction: ${props => props.column? 'column': 'row'};
  justify-content: center;
  align-items: center;  
  padding: 10px;
`
