# Python code to search .properties files in the lang
# folders (We can translate file content and export
# to locales folder) according to the requirements.
import os

# This is to get the directory that the program
# is currently running in.
dir_path = os.getcwd()

locales_index = open(dir_path + '/bin/locales_index.txt', 'w')
manifest_index = open(dir_path + '/bin/manifest_index.txt', 'w')
locales_index.close()
manifest_index.close()

locales_index = open(dir_path + '/bin/locales_index.txt', 'a')
manifest_index = open(dir_path + '/bin/manifest_index.txt', 'a')

for root, dirs, files in os.walk(dir_path):
  for file in files:
    relative_path = root.replace(dir_path + '/', '') + '/' + str(file)

    # put every translatable file into a list.
    if file == 'manifest.webapp':
      if relative_path.startswith('webapps') or relative_path.startswith('dev_webapps') or relative_path.startswith('tv_webapps') or relative_path.startswith('outoftree_apps'):
        print(relative_path)
        manifest_index.write(relative_path + '\n')
        pass

    elif file.endswith('en-US.properties'):
      if relative_path.startswith('shared/locales') or relative_path.startswith('webapps') or relative_path.startswith('dev_webapps') or relative_path.startswith('tv_webapps') or relative_path.startswith('outoftree_apps'):
        print(relative_path)
        locales_index.write(relative_path + '\n')
        pass
      pass

locales_index.close()
manifest_index.close()
