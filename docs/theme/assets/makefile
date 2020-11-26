# Run under msys2

SASS:= /c/Ruby23-x64/bin/sass

./css/main.css: ./sass/main.scss
	$(SASS) --unix-newlines --scss --style nested $< $@	

./sass/main.scss: ./sass/layout/_cbCms.scss
	touch $@
