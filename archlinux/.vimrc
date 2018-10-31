" VIMRC

" Tab width
set tabstop=4
set shiftwidth=4

" Auto tab
" set ai

syntax on

" Mouse scroll wheel and selection
set mouse=a

" Line numbers
set number

" Column 80 ruler
set colorcolumn=80
hi ColorColumn ctermfg=9 ctermbg=0

" Enforce 4bit terminal default colors
set t_Co=16

" Theme
colo noctu

" Make gutter nice
set signcolumn=yes 
hi clear SignColumn

" ALE
" Load all plugins now.
" Plugins need to be added to runtimepath before helptags can be generated.
packloadall
" Load all of the helptags now, after plugins have been loaded.
" All messages and errors will be ignored.
silent! helptags ALL
