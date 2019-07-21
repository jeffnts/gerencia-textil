import fs from 'fs-extra'
import path from 'path'

module.exports ={
  backup: async (backupPath) =>{
    if(!backupPath){ return }

    try{
      await fs.remove(backupPath[0]+'/gerencia_textil_backup')

      await fs.mkdirs(backupPath[0]+'/gerencia_textil_backup')

      await fs.copy(`${path.join(__dirname, '..', 'public')}`, `${backupPath[0]}/gerencia_textil_backup`)


      return 'Backup realizado com sucesso!'
    }catch(error){
      return {
        message: 'Erro ao tentar fazer o backup! Favor, tente novamente.',
        err: true
      }
    }

  },

  restore: async (restorePath) =>{
    if(!restorePath){ return }

    try {
      await fs.copy(path.join(restorePath[0]), path.join(__dirname, '..', 'public'))


      return 'Restauração do Backup realizada com sucesso!'
    }catch (error) {
      return {
        message: 'Erro ao tentar fazer a Restauração do Backup! Favor, tente novamente.' + error,
        err: true
      }
    }
  }
}

