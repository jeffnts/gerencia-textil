import React, { useState, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import Notifications, {notify} from 'react-notify-toast'
import { confirmAlert } from 'react-confirm-alert'


import path from 'path'


import {
  SEND_BACKUP,
  GET_BACKUP,
  SEND_RESTORE,
  GET_RESTORE } from '../../../../config/utils/constants'

const  shirt = path.join(__dirname, '..', '..', '..', 'icons', 'shirt.png')
const  shirts = path.join(__dirname, '..', '..', '..', 'icons', 'shirts.png')
const  report  = path.join(__dirname, '..', '..', '..', 'icons',  'report.png')
const  reports  = path.join(__dirname, '..', '..', '..', 'icons',  'reports.png')
const  restore  = path.join(__dirname, '..', '..', '..', 'icons',  'restore.png')
const  download  = path.join(__dirname, '..', '..', '..', 'icons',  'download.png')

import   { LoadedPageContext }  from '../../../store'

import { Wrapper } from './NavBarStyle'

const Navbar = () => {
  const { setIsLoadedPage, setLoadingMessage }  = useContext(LoadedPageContext)

  const electron = window.require('electron')
  const { dialog } = electron.remote
  const ipc = electron.ipcRenderer


  async function handleBackup(){
    try {
      setIsLoadedPage(true)
      setLoadingMessage('Realizando o Backup...')

      const backupPath = dialog.showOpenDialog(
        { title: 'Selecione a pasta para salvar o Backup das imagens.',
          properties: ['openDirectory']
        },
        {},
        ()  =>{ }
      )

      !backupPath ? setIsLoadedPage(false): null

      ipc.send(SEND_BACKUP, backupPath)

      ipc.on(GET_BACKUP, (event, arg) =>{
        const backup = JSON.parse(arg.data)

        if(backup.err){
          setIsLoadedPage(false)

          confirmAlert({
            title: 'Erro',
            message: backup.message,
            buttons: [
              {
                label: 'Fechar',
                onClick: () => {}
              }
            ]
          })
        }else{
          notify.show(backup, 'success', 2000)

          setIsLoadedPage(false)
        }
      })

    }catch(error){

      notify.show(error, 'error', 2000)
    }

  }

  async function handleRestore(){
    try {
      setIsLoadedPage(true)
      setLoadingMessage('Restaurando os Dados...')

      const restorePath = dialog.showOpenDialog(
        { title: 'Selecione a pasta que contem os arquivos para restauração do sistema.',
          properties: ['openDirectory']
        },
        {},
        ()  =>{ }
      )

      !restorePath ? setIsLoadedPage(false): null

      ipc.send(SEND_RESTORE, restorePath)

      ipc.on(GET_RESTORE, (event, arg) =>{
        const restore = JSON.parse(arg.data)

        if(restore.err){
          setIsLoadedPage(false)
          confirmAlert({
            title: 'Erro',
            message: restore.message,
            buttons: [
              {
                label: 'Fechar',
                onClick: () => {}
              }
            ]
          })
        }else{
          notify.show(restore, 'success', 2000)

          setIsLoadedPage(false)
        }
      })

    }catch(error){
      notify.show(error, 'error', 2000)
    }
  }

  return (
    <Wrapper>
      <nav data-role="ribbonmenu">
      <Notifications/>

      <ul className="tabs-holder">
        <li><a href="#section-one"><span className="mif-home"></span> Início</a></li>
        <li><a href="#section-two"><span className="mif-cog"></span> Configurações</a></li>
      </ul>

      <div className="content-holder">

        {/*------------------------------------Section 1 - Home------------------------------*/}
        <div className="section" id="section-one">
          <div className="group">
            <NavLink to='/'>
              <button className="ribbon-button">
                <span className="icon">
                  <img src={shirt} alt=''/>
                </span>
                <span className="caption">Nova Peça</span>
              </button>
            </NavLink>

            <NavLink to='/lista-pecas'>
              <button className="ribbon-button">
                <span className="icon">
                  <img src={shirts} alt=''/>
                </span>
                <span className="caption">Todas as Peças</span>
              </button>
            </NavLink>

            <span className="title">Peças</span>
          </div>


          {/*--------------------Report-------------------------*/}
          <div className="group">
            <NavLink to='/novo-relatorio'>
              <button className="ribbon-button">
              <span className="icon">
                <img src={report} alt=''/>
              </span>
                <span className="caption">Novo Relatório</span>
              </button>
            </NavLink>

            <NavLink to='/lista-relatorios'>
              <button className="ribbon-button">
              <span className="icon">
                <img src={reports} alt=''/>
              </span>
                <span className="caption">Todos Relatórios</span>
              </button>
            </NavLink>

            <span className="title">Relatórios</span>
          </div>


        </div>


        {/*------------------------------------Section 2 - Settings------------------------------*/}
        <div className="section" id="section-two">

          <button className="ribbon-button"
                  onClick={handleBackup}
          >
            <span className="icon">
              <img src={download} alt=''/>
            </span>
            <span className="caption">Download do Backup</span>
          </button>

          <button className="ribbon-button"
                  onClick={handleRestore}
          >
            <span className="icon">
              <img src={restore} alt=''/>
            </span>
            <span className="caption">Restaurar Backup</span>
          </button>

        </div>
        {/*----------------------------------------------------------------------------------*/}
      </div>
    </nav>
    </Wrapper>    
  )
}

export default Navbar
