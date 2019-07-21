import React, { useContext } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import LoadingOverlay from 'react-loading-overlay'

import { NewPiece, ListPieces, ShowPiece, EditPiece } from '../containers/Piece'
import { NewReport, ListReports, ShowReport, EditReport, PDFReport } from '../containers/Report'

import { Navbar } from '../components/UI'

import { LoadedPageContext } from '../store';


export const Routes = () => {
  const { isLoadedPage, loadingMessage, isPrintPage }  = useContext(LoadedPageContext)

  return (
      <Router>
        <LoadingOverlay
          active={isLoadedPage}
          spinner
          text={loadingMessage}
        >
        <div
         style={{display: isPrintPage === true? 'none': null}}
        >
          <Navbar/>
        </div>
        <Switch>
          <Route exact path='/' component={NewPiece}/>
          <Route path='/lista-pecas' component={ListPieces}/>
          <Route path='/peca' component={ShowPiece}/>
          <Route path='/editar-peca' component={EditPiece}/>

          <Route path='/novo-relatorio' component={NewReport}/>
          <Route path='/lista-relatorios' component={ListReports}/>
          <Route path='/relatorio' component={ShowReport}/>
          <Route path='/editar-relatorio' component={EditReport}/>
          <Route path='/pdf-relatorio/:id' component={PDFReport}/>
        </Switch>
        </LoadingOverlay>
      </Router>
  )
}


