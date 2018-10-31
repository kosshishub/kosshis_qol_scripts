#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
# PS1='[\u@\h \W]\$ '

export PS1="$(tput setaf 6)\u$(tput sgr0)>$(tput setaf 5)\W$(tput sgr0) "

