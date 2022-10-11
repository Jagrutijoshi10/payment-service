# rename docker file
sed -i 's/staging/prod/g;s/stage2/prod/g;s/stage3/prod/g;s/stage4/prod/g;' dockerfile
# generate image
sudo docker build -t prod_umobile_app_payment_management .
# tag image
sudo docker tag prod_umobile_app_payment_management asia.gcr.io/um-production/prod_umobile_app_payment_management:v$1
# push image
sudo docker push asia.gcr.io/um-production/prod_umobile_app_payment_management:v$1